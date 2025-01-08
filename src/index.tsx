import { Hono } from 'hono'
import { renderToString } from 'react-dom/server'
import { Context } from 'hono';
import { z } from 'zod';

interface Env {
  DB: D1Database;
}

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
  notes: z.string().optional(),
  is_active: z.number().nonnegative().optional(),
});

const brewSchema = z.object({
  brew_date: z.string(),
  bean_id: z.number().int().positive(),
  bean_amount: z.number().nonnegative(),
  cups: z.number().int().nonnegative(),
  grind_size: z.string(),
  water_temp: z.number().nonnegative(),
  bloom_water_amount: z.number().nonnegative().optional(),
  bloom_time: z.number().nonnegative().optional(),
  pours: z.array(z.number().nonnegative()).optional(),
  overall_score: z.number().nonnegative().optional(),
  bitterness: z.number().nonnegative().optional(),
  acidity: z.number().nonnegative().optional(),
  sweetness: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

app.post('/api/beans', async (c: Context<{ Bindings: Env }>) => {
  try {
    const bean = await c.req.json();
    bean.is_active = bean.is_active ? 1 : 0;
    const parsedBean = beanSchema.parse(bean);

    const { name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photo_url, notes, is_active } = parsedBean;

    const result = await c.env.DB.prepare(
      `INSERT INTO beans (name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photo_url, notes, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photo_url, notes, is_active)
      .run();

    const insertedBean = {
      id: result.meta.last_row_id,
      name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photo_url, notes, is_active
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

app.get('/api/beans', async (c: Context<{ Bindings: Env }>) => {
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

app.put('/api/beans/:id', async (c: Context<{ Bindings: Env }>) => {
  try {
    const bean = await c.req.json();
    bean.is_active = bean.is_active ? 1 : 0;
    const parsedBean = beanSchema.parse(bean);
    const { name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photo_url, notes, is_active } = parsedBean;

    const updateResult = await c.env.DB.prepare(
      `UPDATE beans
       SET name = ?, country = ?, area = ?, drying_method = ?, processing_method = ?, roast_level = ?, roast_date = ?, purchase_date = ?, purchase_amount = ?, price = ?, seller = ?, seller_url = ?, photo_url = ?, notes = ?, is_active = ?
       WHERE id = ?`
    )
      .bind(name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photo_url, notes, is_active, c.req.param('id'))
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

app.delete('/api/beans/:beanId', async (c: Context<{ Bindings: Env }>) => {
  try {
    const beanId = c.req.param('beanId');

    if (!beanId) {
      return c.json({ error: 'Bean ID is required' }, 400);
    }

    // `brews` を削除
    const deleteBrewsResult = await c.env.DB.prepare(
      `DELETE FROM brews WHERE bean_id = ?`
    )
      .bind(beanId)
      .run();

    if (!deleteBrewsResult.success) {
      throw new Error(`Failed to delete brews for bean ID ${beanId}`);
    }

    // `beans` を削除
    const deleteBeanResult = await c.env.DB.prepare(
      `DELETE FROM beans WHERE id = ?`
    )
      .bind(beanId)
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

app.post('/api/brews', async (c) => {
  try {
    const brew = await c.req.json();
    const parsedBrew = brewSchema.parse(brew);

    const {
      brew_date,
      bean_id,
      bean_amount,
      cups,
      grind_size,
      water_temp,
      bloom_water_amount,
      bloom_time,
      pours,
      overall_score,
      bitterness,
      acidity,
      sweetness,
      notes,
    } = parsedBrew;

    const insertResult = await c.env.DB.prepare(
      `INSERT INTO brews (brew_date, bean_id, bean_amount, cups, grind_size, water_temp, bloom_water_amount, bloom_time, pours, overall_score, bitterness, acidity, sweetness, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        brew_date,
        bean_id,
        bean_amount,
        cups,
        grind_size,
        water_temp,
        bloom_water_amount,
        bloom_time,
        pours,
        overall_score,
        bitterness,
        acidity,
        sweetness,
        notes
      )
      .run();

    if (!insertResult.success) {
      throw new Error('Failed to insert brew log');
    }

    const brew_id = insertResult.meta.last_row_id;

    const insertedBrew = {
      id: brew_id,
      ...parsedBrew,
    };

    return c.json(insertedBrew, 201);
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

app.put('/api/brews/:id', async (c) => {
  try {
    const brew = await c.req.json();
    const parsedBrew = brewSchema.parse(brew);

    const { brew_date, bean_id, bean_amount, cups, grind_size, water_temp, bloom_water_amount: bloom_water_amount, bloom_time, pours, overall_score, bitterness, acidity, sweetness, notes } = parsedBrew;

    const updateResult = await c.env.DB.prepare(
      `UPDATE brews
       SET brew_date = ?, bean_id = ?, bean_amount = ?, cups = ?, grind_size = ?, water_temp = ?, bloom_water_amount = ?, bloom_time = ?, pours = ?, overall_score = ?, bitterness = ?, acidity = ?, sweetness = ?, notes = ?
       WHERE id = ?`
    )
      .bind(brew_date, bean_id, bean_amount, cups, grind_size, water_temp, bloom_water_amount, bloom_time, pours, overall_score, bitterness, acidity, sweetness, notes, c.req.param('id'))
      .run();

    if (!updateResult.success) {
      throw new Error('Failed to update brew log');
    }

    return c.json({ message: 'Brew log and pours updated successfully' });
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

app.get('/api/brews', async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM brews').all();
    const parsedResults = results.map((brew: any) => ({
      ...brew,
      pours: JSON.parse(brew.pours)
    }));
    return c.json(parsedResults);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    } else {
      return c.json({ error: 'An unexpected error occurred' }, 500);
    }
  }
});

app.delete('/api/brews/:brewId', async (c) => {
  try {
    const brewId = c.req.param('brewId');

    if (!brewId) {
      return c.json({ error: 'Brew ID is required' }, 400);
    }

    // `brews` テーブルのデータを削除
    const deleteBrewResult = await c.env.DB.prepare(
      `DELETE FROM brews WHERE id = ?`
    )
      .bind(brewId)
      .run();

    if (!deleteBrewResult.success) {
      throw new Error(`Failed to delete brew with ID ${brewId}`);
    }

    return c.json({ message: `Brew with ID ${brewId} is deleted successfully` }, 200);
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

app.get('*', (c) => {
  return c.html(
    renderToString(
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          {import.meta.env.PROD ? (
            <>
              <link rel="stylesheet" href="/static/assets/style.css" />
              <script type="module" src="/static/client.js"></script>
            </>
          ) : (
            <>
              <link rel="stylesheet" href="/src/style.css" />
              <script type="module" src="/src/client.tsx"></script>
            </>
          )}
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    )
  )
})

export default app