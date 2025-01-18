import { Hono, Context } from 'hono'
import { Env } from '../../index'
import { z } from 'zod'

const app = new Hono<{ Bindings: Env }>();

const brewSchema = z.object({
  bean_id: z.number().int().positive(),
  bean_amount: z.number().nonnegative().optional(),
  cups: z.number().int().nonnegative().optional(),
  grind_size: z.string().optional(),
  water_temp: z.number().nonnegative().optional(),
  bloom_water_amount: z.number().nonnegative().optional(),
  bloom_time: z.number().nonnegative().optional(),
  pours: z.array(z.number().nonnegative()).optional(),
  overall_score: z.number().nonnegative().optional(),
  bitterness: z.number().nonnegative().optional(),
  acidity: z.number().nonnegative().optional(),
  sweetness: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

app.post('/', async (c) => {
  const user = c.get('user');
  try {
    const brew = await c.req.json();
    const parsedBrew = brewSchema.parse(brew);

    const {
      bean_id,
      bean_amount = 0,
      cups = 0,
      grind_size = '',
      water_temp = 0,
      bloom_water_amount = 0,
      bloom_time = 0,
      pours = [],
      overall_score = 0,
      bitterness = 0,
      acidity = 0,
      sweetness = 0,
      notes = '',
    } = parsedBrew;

    const insertResult = await c.env.DB.prepare(
      `INSERT INTO brews (bean_id, bean_amount, cups, grind_size, water_temp, bloom_water_amount, bloom_time, pours, overall_score, bitterness, acidity, sweetness, notes, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        bean_id,
        bean_amount,
        cups,
        grind_size,
        water_temp,
        bloom_water_amount,
        bloom_time,
        JSON.stringify(pours),
        overall_score,
        bitterness,
        acidity,
        sweetness,
        notes,
        user.id
      )
      .run();

    if (!insertResult.success) {
      throw new Error('Failed to insert brew log');
    }

    const brew_id = insertResult.meta.last_row_id;

    const insertedBrew = { id: brew_id, ...parsedBrew };
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

app.put('/:id', async (c) => {
  const user = c.get('user');
  try {
    const brew = await c.req.json();
    const parsedBrew = brewSchema.parse(brew);

    const { bean_id, bean_amount, cups, grind_size, water_temp, bloom_water_amount: bloom_water_amount, bloom_time, pours, overall_score, bitterness, acidity, sweetness, notes } = parsedBrew;

    const updateResult = await c.env.DB.prepare(
      `UPDATE brews
       SET bean_id = ?, bean_amount = ?, cups = ?, grind_size = ?, water_temp = ?, bloom_water_amount = ?, bloom_time = ?, pours = ?, overall_score = ?, bitterness = ?, acidity = ?, sweetness = ?, notes = ?
       WHERE id = ? AND user_id = ?`
    )
      .bind(bean_id, bean_amount, cups, grind_size, water_temp, bloom_water_amount, bloom_time, JSON.stringify(pours), overall_score, bitterness, acidity, sweetness, notes, c.req.param('id'), user.id)
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

app.get('/', async (c: Context<{ Bindings: Env }>) => {
  const user = c.get('user');
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM brews WHERE user_id = ? ORDER BY created_at DESC`
    ).bind(user.id).all();
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

app.delete('/:id', async (c) => {
  const user = c.get('user');
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'Brew ID is required' }, 400);
    }

    // `brews` テーブルのデータを削除
    const deleteBrewResult = await c.env.DB.prepare(
      `DELETE FROM brews WHERE id = ? AND user_id = ?`
    )
      .bind(id, user.id)
      .run();

    if (!deleteBrewResult.success) {
      throw new Error(`Failed to delete brew with ID ${id}`);
    }

    return c.json({ message: `Brew with ID ${id} is deleted successfully` }, 200);
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