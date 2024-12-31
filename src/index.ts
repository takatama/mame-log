import { Hono } from 'hono';
import { Context } from 'hono';
import { z } from 'zod';

interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

const beanSchema = z.object({
  name: z.string(),
  origin: z.string().optional(),
  roast_level: z.string().optional(),
  purchase_date: z.string().optional(),
  roast_date: z.string().optional(),
  photo_url: z.string().url().optional(),
});

const pourSchema = z.object({
  pour_number: z.number().int().positive(),
  pour_amount: z.number().positive(),
  flow_rate: z.number().positive().optional(),
});

const brewLogSchema = z.object({
  bean_id: z.number().int().positive(),
  grind_size: z.string(),
  water_temp: z.number().positive(),
  bloom_time: z.number().int().positive(),
  bloom_water: z.number().positive(),
  brew_date: z.string(),
  pours: z.array(pourSchema),
});

app.post('/beans', async (c: Context<{ Bindings: Env }>) => {
  try {
    const bean = await c.req.json();
    const parsedBean = beanSchema.parse(bean);

    const { name, origin, roast_level, purchase_date, roast_date, photo_url } = parsedBean;

    await c.env.DB.prepare(
      `INSERT INTO beans (name, origin, roast_level, purchase_date, roast_date, photo_url)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(name, origin, roast_level, purchase_date, roast_date, photo_url)
      .run();

    return c.json({ message: 'Bean added successfully' }, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    } else {
      return c.json({ error: 'An unexpected error occurred' }, 400);
    }
  }
});

app.get('/beans', async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM beans').all();
    return c.json(results);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    } else {
      return c.json({ error: 'An unexpected error occurred' }, 500);
    }
  }
});

app.post('/brew-logs', async (c) => {
  try {
    const brewLog = await c.req.json();
    const parsedBrewLog = brewLogSchema.parse(brewLog);

    const { bean_id, grind_size, water_temp, bloom_time, bloom_water, brew_date, pours } = parsedBrewLog;

    const insertResult = await c.env.DB.prepare(
      `INSERT INTO brew_logs (bean_id, grind_size, water_temp, bloom_time, bloom_water, brew_date)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(bean_id, grind_size, water_temp, bloom_time, bloom_water, brew_date)
      .run();

    if (!insertResult.success) {
      throw new Error('Failed to insert brew log');
    }

    const brewLogId = insertResult.meta.last_row_id;

    for (const pour of pours) {
      const { pour_number, pour_amount, flow_rate } = pour;
      const insertPour = await c.env.DB.prepare(
        `INSERT INTO pours (brew_log_id, pour_number, pour_amount, flow_rate)
         VALUES (?, ?, ?, ?)`
      )
        .bind(brewLogId, pour_number, pour_amount, flow_rate)
        .run();

      if (!insertPour.success) {
        throw new Error(`Failed to insert pour with pour_number ${pour_number}`);
      }
    }

    return c.json({ message: 'Brew log and pours added successfully' }, 201);
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      400
    );
  }
});

app.get('/brew-logs', async (c: Context<{ Bindings: Env }>) => {
  try {
    const brewLogs = await c.env.DB.prepare('SELECT * FROM brew_logs').all();
    const results = [];

    for (const brewLog of brewLogs.results) {
      const pours = await c.env.DB.prepare('SELECT * FROM pours WHERE brew_log_id = ?')
        .bind(brewLog.id)
        .all();
      results.push({ ...brewLog, pours: pours.results });
    }

    return c.json(results);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    } else {
      return c.json({ error: 'An unexpected error occurred' }, 500);
    }
  }
});

export default app;
