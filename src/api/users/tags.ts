import { Hono } from 'hono';
import { Env } from '../../index';
import { z } from 'zod';

const app = new Hono<{ Bindings: Env }>();

// タグのスキーマ
const tagSchema = z.object({
  name: z.string().min(1, 'Tag name cannot be empty'),
});

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
  const tagId = c.req.param('id');
  try {
    if (!tagId) {
      return c.json({ error: 'Tag ID is required' }, 400);
    }

    const deleteResult = await c.env.DB.prepare(
      `DELETE FROM tags WHERE id = ? AND user_id = ?`
    )
      .bind(tagId, user.id)
      .run();

    if (!deleteResult.success) {
      throw new Error(`Failed to delete tag with ID ${tagId}`);
    }

    return c.json({ message: `Tag with ID ${tagId} deleted successfully` });
  } catch (error) {
    console.error(error);
    return c.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      400
    );
  }
});

export default app;
