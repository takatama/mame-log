import { Hono, Context } from 'hono'
import { Env } from './index'
import { z } from 'zod'

const app = new Hono<{ Bindings: Env }>();

const beanSchema = z.object({
  name: z.string(),
  country: z.string().optional(),
  area: z.string().optional(),
  drying_method: z.string().optional(),
  processing_method: z.string().optional(),
  roast_level: z.string().optional(),
  roast_date: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_amount: z.number().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
  seller: z.string().optional(),
  seller_url: z.string().optional(), // string().url() にすると空の場合にエラーになる
  photo_url: z.string().optional(),
  photo_data_url: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.number().nonnegative().optional(),
});

app.post('/', async (c: Context<{ Bindings: Env }>) => {
  try {
    const bean = await c.req.json();
    bean.is_active = bean.is_active ? 1 : 0;
    const parsedBean = beanSchema.parse(bean);

    const {
      name = '',
      country = '',
      area = '',
      drying_method = '',
      processing_method = '',
      roast_level = '',
      roast_date = '',
      purchase_date = '',
      purchase_amount = '',
      price = 0,
      seller = '',
      seller_url = '',
      photo_url = '',
      photo_data_url = '',
      notes = '',
      is_active = 0
    } = parsedBean;

    const photoKey = photo_url || `/images/coffee-labels/${crypto.randomUUID()}.png`;

    if (photo_data_url) {
      const photoData = photo_data_url.split(",")[1]; // "data:image/png;base64,..." の形式を想定
      const photoBuffer = Buffer.from(photoData, "base64");
      const photoArrayBuffer = photoBuffer.buffer; // BufferをArrayBufferに変換
    
      await c.env.MAME_LOG_IMAGES.put(photoKey, photoArrayBuffer, {
        metadata: { contentType: "image/png" },
      });
    }

    const result = await c.env.DB.prepare(
      `INSERT INTO beans (name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photo_url, notes, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photoKey, notes, is_active)
      .run();

    const insertedBean = {
      id: result.meta.last_row_id,
      name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photo_url: photoKey, notes, is_active
    }
    return c.json(insertedBean, 201);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    } else {
      return c.json({ error: 'An unexpected error occurred' }, 400);
    }
  }
});

app.get('/', async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM beans').all();
    return c.json(results);
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
  try {
    const bean = await c.req.json();
    bean.is_active = bean.is_active ? 1 : 0;
    const parsedBean = beanSchema.parse(bean);
    const { name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photo_url, photo_data_url, notes, is_active } = parsedBean;

    const photoKey = photo_url || `/images/coffee-labels/${crypto.randomUUID()}.png`;

    if (photo_data_url) {
      const photoData = photo_data_url.split(",")[1]; // "data:image/png;base64,..." の形式を想定
      const photoBuffer = Buffer.from(photoData, "base64");
      const photoArrayBuffer = photoBuffer.buffer; // BufferをArrayBufferに変換
    
      await c.env.MAME_LOG_IMAGES.put(photoKey, photoArrayBuffer, {
        metadata: { contentType: "image/png" },
      });
    }

    const updateResult = await c.env.DB.prepare(
      `UPDATE beans
       SET name = ?, country = ?, area = ?, drying_method = ?, processing_method = ?, roast_level = ?, roast_date = ?, purchase_date = ?, purchase_amount = ?, price = ?, seller = ?, seller_url = ?, photo_url = ?, notes = ?, is_active = ?
       WHERE id = ?`
    )
      .bind(name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photoKey, notes, is_active, c.req.param('id'))
      .run();

    if (!updateResult.success) {
      throw new Error('Failed to update bean');
    }

    return c.json({ message: 'Bean updated successfully' });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    } else {
      return c.json({ error: 'An unexpected error occurred' }, 400);
    }
  }
});

app.delete('/:id', async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'Bean ID is required' }, 400);
    }

    // TODO KVの写真を削除

    // `brews` を削除
    const deleteBrewsResult = await c.env.DB.prepare(
      `DELETE FROM brews WHERE bean_id = ?`
    )
      .bind(id)
      .run();

    if (!deleteBrewsResult.success) {
      throw new Error(`Failed to delete brews for bean ID ${id}`);
    }

    // `beans` を削除
    const deleteBeanResult = await c.env.DB.prepare(
      `DELETE FROM beans WHERE id = ?`
    )
      .bind(id)
      .run();

    if (!deleteBeanResult.success) {
      throw new Error(`Failed to delete bean with ID ${id}`);
    }

    return c.json({ message: `Bean with ID ${id} and its related brews and pours were deleted successfully` }, 200);
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