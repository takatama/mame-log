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
  purchase_amount: z.number().positive().optional(),
  price: z.number().positive().optional(),
  seller: z.string().optional(),
  seller_url: z.string().url().optional(),
  photo_url: z.string().url().optional(),
  notes: z.string().optional(),
  is_active: z.number().optional(),
});

const pourSchema = z.object({
  brew_id: z.number().int().positive(),
  idx: z.number().nonnegative(),
  amount: z.number().positive().optional(),
  flow_rate: z.string().optional(),
  time: z.number().nonnegative().optional(),
});

const brewSchema = z.object({
  brew_date: z.string(),
  bean_id: z.number().int().positive(),
  bean_amount: z.number().positive(),
  cups: z.number().int().positive(),
  grind_size: z.string(),
  water_temp: z.number().positive(),
  overall_score: z.number().positive(),
  bitterness: z.number().positive().optional(),
  acidity: z.number().positive().optional(),
  sweetness: z.number().positive().optional(),
  notes: z.string().optional(),
  pours: z.array(pourSchema),
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

    // `brews` に関連する `pours` を削除
    const deletePoursResult = await c.env.DB.prepare(
      `DELETE FROM pours WHERE brew_id IN (SELECT id FROM brews WHERE bean_id = ?)`
    )
      .bind(beanId)
      .run();

    if (!deletePoursResult.success) {
      throw new Error(`Failed to delete pours for bean ID ${beanId}`);
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
      overall_score,
      bitterness,
      acidity,
      sweetness,
      notes,
      pours
    } = parsedBrew;

    const insertResult = await c.env.DB.prepare(
      `INSERT INTO brews (brew_date, bean_id, bean_amount, cups, grind_size, water_temp, overall_score, bitterness, acidity, sweetness, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        brew_date,
        bean_id,
        bean_amount,
        cups,
        grind_size,
        water_temp,
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

    const insertedPours = [];
    for (const pour of pours) {
      const { idx, amount, flow_rate, time } = pour;
      const insertPour = await c.env.DB.prepare(
        `INSERT INTO pours (brew_id, idx, amount, flow_rate, time)
         VALUES (?, ?, ?, ?, ?)`
      )
        .bind(brew_id, idx, amount, flow_rate, time)
        .run();

      if (!insertPour.success) {
        throw new Error(`Failed to insert pour ${idx} for brew ${brew_id}`);
      }

      insertedPours.push({ idx, amount, flow_rate, time });
    }

    const insertedBrew = {
      id: brew_id,
      brew_date,
      bean_id,
      bean_amount,
      cups,
      grind_size,
      water_temp,
      overall_score,
      bitterness,
      acidity,
      sweetness,
      notes,
      pours: insertedPours
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

    const { brew_date, bean_id, bean_amount, cups, grind_size, water_temp, overall_score, bitterness, acidity, sweetness, notes, pours } = parsedBrew;

    const updateResult = await c.env.DB.prepare(
      `UPDATE brews
       SET brew_date = ?, bean_id = ?, bean_amount = ?, cups = ?, grind_size = ?, water_temp = ?, overall_score = ?, bitterness = ?, acidity = ?, sweetness = ?, notes = ?
       WHERE id = ?`
    )
      .bind(brew_date, bean_id, bean_amount, cups, grind_size, water_temp, overall_score, bitterness, acidity, sweetness, notes, c.req.param('id'))
      .run();

    if (!updateResult.success) {
      throw new Error('Failed to update brew log');
    }

    const brew_id = c.req.param('id');

    await c.env.DB.prepare('DELETE FROM pours WHERE brew_id = ?').bind(brew_id).run();

    for (const pour of pours) {
      const { idx, amount, flow_rate, time } = pour;
      const insertPour = await c.env.DB.prepare(
        `INSERT INTO pours (brew_id, idx, amount, flow_rate, time)
         VALUES (?, ?, ?, ?, ?)`
      )
        .bind(brew_id, idx, amount, flow_rate, time)
        .run();

      if (!insertPour.success) {
        throw new Error(`Failed to insert pour ${idx} for brew ${brew_id}`);
      }
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
    const brews = await c.env.DB.prepare('SELECT * FROM brews').all();
    const results = [];

    for (const brew of brews.results) {
      const pours = await c.env.DB.prepare('SELECT * FROM pours WHERE brew_id = ?')
        .bind(brew.id)
        .all();
      results.push({ ...brew, pours: pours.results });
    }

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

app.delete('/api/brews/:brewId', async (c) => {
  try {
    const brewId = c.req.param('brewId');

    if (!brewId) {
      return c.json({ error: 'Brew ID is required' }, 400);
    }

    // 削除対象の pours データを削除
    const deletePoursResult = await c.env.DB.prepare(
      `DELETE FROM pours WHERE brew_id = ?`
    )
      .bind(brewId)
      .run();

    if (!deletePoursResult.success) {
      throw new Error(`Failed to delete pours for brew ID ${brewId}`);
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

    return c.json({ message: `Brew with ID ${brewId} and its pours were deleted successfully` }, 200);
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