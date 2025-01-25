import { Hono, Context } from 'hono'
import { Env } from '../../index'
import { z } from 'zod'
import { processTags } from './tags';

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
  tagIds: z.array(z.number()).optional(),
  created_at: z.string().optional(),
});

app.post('/', async (c) => {
  const user = c.get('user');
  try {
    const brew = await c.req.json();
    const parsedBrew = brewSchema.parse(brew);

    const now = new Date();
    const currentUtcDatetime = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;

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
      tagIds = [],
      created_at = currentUtcDatetime,
    } = parsedBrew;

    const insertResult = await c.env.DB.prepare(
      `INSERT INTO brews (bean_id, bean_amount, cups, grind_size, water_temp, bloom_water_amount, bloom_time, pours, overall_score, bitterness, acidity, sweetness, notes, user_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
        user.id,
        created_at
      )
      .run();

    if (!insertResult.success) {
      throw new Error('Failed to insert brew log');
    }

    const brewId = insertResult.meta.last_row_id;

    // タグ処理
    await processTags(c, user.id, brewId, tagIds, 'brew');

    const insertedBrew = {
      id: brewId,
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
      created_at,
      tagIds,
    };

    return c.json(insertedBrew, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }, 400);
  }
});

app.put('/:id', async (c) => {
  const user = c.get('user');
  try {
    const brewId = c.req.param('id');
    const brew = await c.req.json();
    const parsedBrew = brewSchema.parse(brew);
    const {
      bean_id,
      bean_amount = '',
      cups = '',
      grind_size = '',
      water_temp = '',
      bloom_water_amount = '',
      bloom_time = '',
      pours = [],
      overall_score = '',
      bitterness = '',
      acidity = '',
      sweetness = '',
      notes = '',
      tagIds = []
    } = parsedBrew;

    const updateResult = await c.env.DB.prepare(
      `UPDATE brews
       SET bean_id = ?, bean_amount = ?, cups = ?, grind_size = ?, water_temp = ?, bloom_water_amount = ?, bloom_time = ?, pours = ?, overall_score = ?, bitterness = ?, acidity = ?, sweetness = ?, notes = ?
       WHERE id = ? AND user_id = ?`
      ).bind(
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
        brewId,
        user.id
      ).run();
    
    if (!updateResult.success) {
      throw new Error('Failed to update brew log');
    }

    // タグ処理
    await processTags(c, user.id, Number(brewId), tagIds, 'brew');

    return c.json({ message: 'Brew log updated successfully', id: brewId, tagIds });
  } catch (error) {
    console.error(error);
    return c.json({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }, 400);
  }
});

export async function deleteBrew(c: Context<{ Bindings: Env }>, brewId: number, userId: string) {
  // `brew_tags` を削除
  const deleteTagsResult = await c.env.DB.prepare(
    `DELETE FROM brew_tags WHERE brew_id = ? AND user_id = ?`
  )
    .bind(brewId, userId)
    .run();

  if (!deleteTagsResult.success) {
    throw new Error(`Failed to delete tags for brew ID ${brewId}`);
  }

  // `brews` を削除
  const deleteBrewResult = await c.env.DB.prepare(
    `DELETE FROM brews WHERE id = ? AND user_id = ?`
  )
    .bind(brewId, userId)
    .run();

  if (!deleteBrewResult.success) {
    throw new Error(`Failed to delete brew with ID ${brewId}`);
  }
}

app.delete('/:id', async (c) => {
  const user = c.get('user');
  try {
    const id = Number(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'Brew ID is required' }, 400);
    }

    // 共通関数を利用して削除
    await deleteBrew(c, id, user.id);

    return c.json({ message: `Brew with ID ${id} and its related tags are deleted successfully` }, 200);
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
        brews.id AS brew_id,
        brews.bean_id,
        brews.bean_amount,
        brews.cups,
        brews.grind_size,
        brews.water_temp,
        brews.bloom_water_amount,
        brews.bloom_time,
        brews.pours,
        brews.overall_score,
        brews.bitterness,
        brews.acidity,
        brews.sweetness,
        brews.notes,
        brews.created_at,
        json_group_array(brew_tags.tag_id) AS tag_ids
       FROM brews
       LEFT JOIN brew_tags ON brews.id = brew_tags.brew_id
       WHERE brews.user_id = ?
       GROUP BY brews.id
       ORDER BY brews.created_at DESC`
    ).bind(user.id).all();

    return c.json(results.map((row: any) => ({
      id: row.brew_id,
      bean_id: row.bean_id,
      bean_amount: row.bean_amount,
      cups: row.cups,
      grind_size: row.grind_size,
      water_temp: row.water_temp,
      bloom_water_amount: row.bloom_water_amount,
      bloom_time: row.bloom_time,
      pours: JSON.parse(row.pours || '[]'),
      overall_score: row.overall_score,
      bitterness: row.bitterness,
      acidity: row.acidity,
      sweetness: row.sweetness,
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