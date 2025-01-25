import { Hono, Context } from 'hono';
import { Env } from '../../index';
import { z } from 'zod';

const app = new Hono<{ Bindings: Env }>();

// タグのスキーマ
const tagSchema = z.object({
  id: z.number().positive().optional(),
  name: z.string().min(1, 'Tag name cannot be empty'),
});

export async function processTags(c: Context<{ Bindings: Env }>, userId: string, resourceId: number, tagIds: number[], resourceName: string) {
  const tableName = `${resourceName}_tags`;
  const resourceIdColumn = `${resourceName}_id`;

  // 既存の関連付けを取得
  const existingTagsQuery = await c.env.DB.prepare(
    `SELECT tag_id FROM ${tableName} WHERE ${resourceIdColumn} = ? AND user_id = ?`
  ).bind(resourceId, userId).all();

  const existingTagIds: number[] = (existingTagsQuery.results || []).map((row) => row.tag_id as number);

  // 新規タグを計算
  const tagsToAdd = tagIds.filter((id) => !existingTagIds.includes(id));
  const tagsToRemove = existingTagIds.filter((id) => !tagIds.includes(id));

  // タグを追加
  if (tagsToAdd.length > 0) {
    for (const tagId of tagsToAdd) {
      await c.env.DB.prepare(
        `INSERT OR IGNORE INTO ${tableName} (${resourceIdColumn}, tag_id, user_id) VALUES (?, ?, ?)`
      ).bind(resourceId, tagId, userId).run();
    }
  }

  // タグを削除
  if (tagsToRemove.length > 0) {
    await c.env.DB.prepare(
      `DELETE FROM ${tableName} WHERE resource_id = ? AND tag_id IN (${tagsToRemove.join(',')}) AND user_id = ?`
    ).bind(resourceId, userId).run();
  }
}

// タグの作成
app.post('/', async (c) => {
  const user = c.get('user');
  try {
    const { name } = tagSchema.parse(await c.req.json());

    const insertResult = await c.env.DB.prepare(
      `INSERT INTO tags (name, user_id) VALUES (?, ?)`
    )
      .bind(name, user.id)
      .run();

    if (!insertResult.success) {
      throw new Error('Failed to create tag');
    }

    const tag_id = insertResult.meta.last_row_id;

    return c.json({ id: tag_id, name }, 201);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      400
    );
  }
});

// ユーザーの全タグを取得
app.get('/', async (c) => {
  const user = c.get('user');
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, name FROM tags WHERE user_id = ? ORDER BY created_at DESC`
    ).bind(user.id).all();

    return c.json(results);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      500
    );
  }
});

// タグの削除
app.delete('/:id', async (c) => {
  const user = c.get('user');
  const tagId = parseInt(c.req.param('id'), 10);

  try {
    if (!tagId) {
      return c.json({ error: 'Tag ID is required' }, 400);
    }

    // 1. `bean_tags` の関連削除
    const deleteBeanTagsResult = await c.env.DB.prepare(
      `DELETE FROM bean_tags WHERE tag_id = ? AND user_id = ?`
    )
      .bind(tagId, user.id)
      .run();

    if (!deleteBeanTagsResult.success) {
      throw new Error(`Failed to delete bean_tags for tag ID ${tagId}`);
    }

    // 2. `brew_tags` の関連削除
    const deleteBrewTagsResult = await c.env.DB.prepare(
      `DELETE FROM brew_tags WHERE tag_id = ? AND user_id = ?`
    )
      .bind(tagId, user.id)
      .run();

    if (!deleteBrewTagsResult.success) {
      throw new Error(`Failed to delete brew_tags for tag ID ${tagId}`);
    }

    // 3. `tags` の削除
    const deleteTagResult = await c.env.DB.prepare(
      `DELETE FROM tags WHERE id = ? AND user_id = ?`
    )
      .bind(tagId, user.id)
      .run();

    if (!deleteTagResult.success) {
      throw new Error(`Failed to delete tag with ID ${tagId}`);
    }

    return c.json({ message: `Tag with ID ${tagId} and its related associations deleted successfully` }, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      400
    );
  }
});

const bulkTagSchema = z.object({
  addedTags: z.array(tagSchema), // 新規作成するタグのリスト
  updatedTags: z.array(tagSchema), // 更新するタグのリスト
  removedTagIds: z.array(z.number().positive()), // 削除するタグのIDリスト
});

// タグの一括操作
app.post('/bulk', async (c) => {
  const user = c.get('user');
  try {
    const { addedTags, updatedTags, removedTagIds } = bulkTagSchema.parse(await c.req.json());

    // バッチクエリを準備
    const batchQueries: any = [];

    // 1. 削除処理
    for (const tagId of removedTagIds) {
      batchQueries.push(c.env.DB.prepare(
        `DELETE FROM bean_tags WHERE tag_id = ? AND user_id = ?`
      ).bind(tagId, user.id));

      batchQueries.push(c.env.DB.prepare(
        `DELETE FROM brew_tags WHERE tag_id = ? AND user_id = ?`
      ).bind(tagId, user.id));

      batchQueries.push(c.env.DB.prepare(
        `DELETE FROM tags WHERE id = ? AND user_id = ?`
      ).bind(tagId, user.id));
    }

    // 2. 更新処理
    for (const tag of updatedTags) {
      batchQueries.push(c.env.DB.prepare(
        `UPDATE tags SET name = ? WHERE id = ? AND user_id = ?`
      ).bind(tag.name, tag.id, user.id));
    }

    // 3. 追加処理
    const addedTagResults = [];
    for (const tag of addedTags) {
      const insertQuery = c.env.DB.prepare(
        `INSERT INTO tags (name, user_id) VALUES (?, ?)`
      ).bind(tag.name, user.id);

      batchQueries.push(insertQuery);
      addedTagResults.push(insertQuery);
    }

    // バッチ実行
    if (batchQueries.length === 0) {
      return c.json({ message: 'No bulk operation is needed.' }, 200);
    }
    const batchResult = await c.env.DB.batch(batchQueries);

    // ユーザーの最新のタグ一覧を取得
    const { results: tags } = await c.env.DB.prepare(
      `SELECT id, name FROM tags WHERE user_id = ? ORDER BY created_at DESC`
    ).bind(user.id).all();

    return c.json({
      message: 'Bulk operation completed successfully',
      tags,
    }, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      400
    );
  }
});

export default app;
