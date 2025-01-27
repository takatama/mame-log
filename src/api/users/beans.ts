import { Hono, Context } from 'hono'
import { Env } from '../../index'
import { z } from 'zod'
import { deleteBrew } from './brews';

const app = new Hono<{ Bindings: Env }>();

const beanSchema = z.object({
  name: z.string(),
  country: z.string().optional(),
  area: z.string().optional(),
  drying_method: z.string().optional(),
  processing_method: z.string().optional(),
  roast_level: z.string().optional(),
  photo_url: z.string().optional(),
  photo_data_url: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.object({
    id: z.number().optional(),
    name: z.string(),
    user_id: z.string().optional(),
  })).optional()
});

const getPhotoKey = (photo_data_url: string, photo_url: string): string => {
  if (photo_url.trim()) {
    return photo_url;
  }
  if (photo_data_url.trim()) {
    return `/api/users/images/coffee-labels/${crypto.randomUUID()}.png`;
  }
  return '';
};

const updatePhoto = async (c: Context, user_id: string, photoKey: string, photo_data_url: string | undefined) => {
  if (!photo_data_url) return;
  const photoData = photo_data_url.split(",")[1]; // "data:image/png;base64,..." の形式を想定
  const photoBuffer = Buffer.from(photoData, "base64");
  const photoArrayBuffer = photoBuffer.buffer; // BufferをArrayBufferに変換

  await c.env.MAME_LOG_IMAGES.put(photoKey, photoArrayBuffer, {
    metadata: { contentType: "image/png", user_id },
  });
}

async function processBeanTags(c: Context<{ Bindings: Env }>, userId: string, beanId: number, tags: any[]) {
  const existingTagsQuery = await c.env.DB.prepare(
    `SELECT tag_id FROM bean_tags WHERE bean_id = ? AND user_id = ?`
  ).bind(beanId, userId).all();

  const existingTagIds: number[] = (existingTagsQuery.results || []).map((row) => row.tag_id as number);

  const newTagIds: number[] = [];

  for (const tag of tags) {
    let tagId = tag.id;

    // タグが新規の場合
    if (!tagId) {
      const tagInsertResult = await c.env.DB.prepare(
        `INSERT INTO tags (name, user_id) VALUES (?, ?)`
      ).bind(tag.name, userId).run();

      if (!tagInsertResult.success) {
        throw new Error(`Failed to create tag: ${tag.name}`);
      }

      tagId = tagInsertResult.meta.last_row_id;
    }

    newTagIds.push(tagId);

    // タグを豆に関連付け
    await c.env.DB.prepare(
      `INSERT OR IGNORE INTO bean_tags (bean_id, tag_id, user_id) VALUES (?, ?, ?)`
    ).bind(beanId, tagId, userId).run();
  }

  // 削除対象のタグを計算して削除
  const tagsToDelete = existingTagIds.filter((id) => !newTagIds.includes(id));
  if (tagsToDelete.length > 0) {
    await c.env.DB.prepare(
      `DELETE FROM bean_tags WHERE bean_id = ? AND tag_id IN (${tagsToDelete.join(',')}) AND user_id = ?`
    ).bind(beanId, userId).run();
  }

  // 更新後のすべてのタグを取得して返却
  const updatedTagsQuery = await c.env.DB.prepare(
    `SELECT tags.id, tags.name
     FROM tags
     JOIN bean_tags ON tags.id = bean_tags.tag_id
     WHERE bean_tags.bean_id = ? AND bean_tags.user_id = ?`
  ).bind(beanId, userId).all();

  return updatedTagsQuery.results || [];
}

app.post('/', async (c: Context<{ Bindings: Env }>) => {
  const user = c.get('user');
  try {
    const bean = await c.req.json();
    const parsedBean = beanSchema.parse(bean);
    const {
      name = '',
      country = '',
      area = '',
      drying_method = '',
      processing_method = '',
      roast_level = '',
      photo_url = '',
      photo_data_url = '',
      notes = '',
      tags = []
    } = parsedBean;

    const photoKey = getPhotoKey(photo_data_url, photo_url);
    updatePhoto(c, user.id, photoKey, photo_data_url);

    const result = await c.env.DB.prepare(
      `INSERT INTO beans (name, country, area, drying_method, processing_method, roast_level, photo_url, notes, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(name, country, area, drying_method, processing_method, roast_level, photoKey, notes, user.id)
      .run();

    const beanId = result.meta.last_row_id;

    // タグ処理（すべてのタグを返却）
    const updatedTags = await processBeanTags(c, user.id, beanId, tags);

    const insertedBean = {
      id: beanId,
      name,
      country,
      area,
      drying_method,
      processing_method,
      roast_level,
      photo_url: photoKey,
      notes,
    };

    return c.json({ ...insertedBean, tags: updatedTags }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }, 400);
  }
});

app.get('/', async (c: Context<{ Bindings: Env }>) => {
  const user = c.get('user');
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT 
        beans.id AS bean_id,
        beans.name,
        beans.country,
        beans.area,
        beans.drying_method,
        beans.processing_method,
        beans.roast_level,
        beans.photo_url,
        beans.notes,
        beans.created_at,
        tags.id AS tag_id,
        tags.name AS tag_name
       FROM beans
       LEFT JOIN bean_tags ON beans.id = bean_tags.bean_id
       LEFT JOIN tags ON bean_tags.tag_id = tags.id
       WHERE beans.user_id = ?
       ORDER BY beans.created_at DESC`
    )
      .bind(user.id)
      .all();

    // データを整形: 各豆に対応するタグを配列としてまとめる
    const beansWithTags = results.reduce((acc: any, row: any) => {
      const existingBean = acc.find((b: any) => b.id === row.bean_id);

      const tag = row.tag_id
        ? { id: row.tag_id, name: row.tag_name, user_id: user.id }
        : null; // タグがない場合は null

      if (existingBean) {
        // 既存の豆にタグを追加
        if (tag) existingBean.tags.push(tag);
      } else {
        // 新しい豆を作成
        acc.push({
          id: row.bean_id,
          name: row.name,
          country: row.country,
          area: row.area,
          drying_method: row.drying_method,
          processing_method: row.processing_method,
          roast_level: row.roast_level,
          photo_url: row.photo_url,
          notes: row.notes,
          created_at: row.created_at,
          tags: tag ? [tag] : [], // タグがない場合は空配列
        });
      }

      return acc;
    }, []);

    return c.json(beansWithTags);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    } else {
      return c.json({ error: 'An unexpected error occurred' }, 500);
    }
  }
});

app.put('/:id', async (c: Context<{ Bindings: Env }>) => {
  const user = c.get('user');
  try {
    const beanId = c.req.param('id');
    const bean = await c.req.json();
    const parsedBean = beanSchema.parse(bean);
    const {
      name = '',
      country = '',
      area = '',
      drying_method = '',
      processing_method = '',
      roast_level = '',
      photo_url = '',
      photo_data_url = '',
      notes = '',
      tags = []
    } = parsedBean;

    const photoKey = getPhotoKey(photo_data_url, photo_url);

    updatePhoto(c, user.id, photoKey, photo_data_url);

    const updateResult = await c.env.DB.prepare(
      `UPDATE beans
       SET name = ?, country = ?, area = ?, drying_method = ?, processing_method = ?, roast_level = ?, photo_url = ?, notes = ?
       WHERE id = ? AND user_id = ?`
    )
      .bind(name, country, area, drying_method, processing_method, roast_level, photoKey, notes, beanId, user.id)
      .run();

    if (!updateResult.success) {
      throw new Error('Failed to update bean');
    }

    // タグ処理（すべてのタグを返却）
    const updatedTags = await processBeanTags(c, user.id, Number(beanId), tags);

    return c.json({ message: 'Bean updated successfully', tags: updatedTags });
  } catch (error) {
    console.error(error);
    return c.json({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }, 400);
  }
});

app.delete('/:id', async (c: Context<{ Bindings: Env }>) => {
  const user = c.get('user');
  try {
    const beanId = c.req.param('id');

    if (!beanId) {
      return c.json({ error: 'Bean ID is required' }, 400);
    }

    // 1. 関連する `brews` を取得
    const { results: brews } = await c.env.DB.prepare(
      `SELECT id FROM brews WHERE bean_id = ? AND user_id = ?`
    )
      .bind(beanId, user.id)
      .all();

    if (brews && brews.length > 0) {
      // 2. 関連する抽出ログを削除
      for (const brew of brews) {
          await deleteBrew(c, Number(brew.id), user.id);
      }
    }

    // `bean_tags` を削除
    const deleteTagsResult = await c.env.DB.prepare(
      `DELETE FROM bean_tags WHERE bean_id = ? AND user_id = ?`
    )
      .bind(beanId, user.id)
      .run();

    if (!deleteTagsResult.success) {
      throw new Error(`Failed to delete tags for bean ID ${beanId}`);
    }

    // KVの写真を削除
    const beanData = await c.env.DB.prepare(
      'SELECT photo_url FROM beans WHERE id = ? AND user_id = ?'
    ).bind(beanId, user.id).first();
    if (!beanData) {
      return c.json({ error: `Bean with ID ${beanId} not found` }, 404);
    }

    const photoKey = beanData.photo_url;
    if (photoKey && typeof photoKey === 'string') {
      await c.env.MAME_LOG_IMAGES.delete(photoKey);
    }

    // `beans` を削除
    const deleteBeanResult = await c.env.DB.prepare(
      `DELETE FROM beans WHERE id = ? AND user_id = ?`
    )
      .bind(beanId, user.id)
      .run();

    if (!deleteBeanResult.success) {
      throw new Error(`Failed to delete bean with ID ${beanId}`);
    }

    return c.json({ message: `Bean with ID ${beanId} and its related brews and pours were deleted successfully` }, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      400
    );
  }
});

export default app