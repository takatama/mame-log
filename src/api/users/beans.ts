import { Hono, Context } from 'hono'
import { Env } from '../../index'
import { z } from 'zod'
import { deleteBrew } from './brews';
import { processTags } from './tags';

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
  tagIds: z.array(z.number()).optional(),
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
      tagIds = [],
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

    // タグ処理
    await processTags(c, user.id, beanId, tagIds, 'bean');

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
      tagIds,
    };

    return c.json(insertedBean, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }, 400);
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
      tagIds = [],
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

    // タグ処理
    await processTags(c, user.id, Number(beanId), tagIds, 'bean');

    return c.json({ message: 'Bean updated successfully', id: beanId, tagIds });
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

    // 関連する `brews` を取得
    const { results: brews } = await c.env.DB.prepare(
      `SELECT id FROM brews WHERE bean_id = ? AND user_id = ?`
    )
      .bind(beanId, user.id)
      .all();

    // 関連する抽出ログを削除
    if (brews && brews.length > 0) {
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
        json_group_array(bean_tags.tag_id) AS tag_ids
       FROM beans
       LEFT JOIN bean_tags ON beans.id = bean_tags.bean_id
       WHERE beans.user_id = ?
       GROUP BY beans.id`
    ).bind(user.id).all();

    return c.json(results.map((row: any) => ({
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
      tagIds: JSON.parse(row.tag_ids || '[]'),
    })));
  } catch (error) {
    console.error(error);
    return c.json({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }, 500);
  }
});

export default app