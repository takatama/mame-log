import { Hono } from 'hono';
import { Env } from '../../index';
import { DefaultBrewSettings as initialSettings } from '../../settings/DefaultBrewSettings';

const settings = new Hono<{ Bindings: Env }>();

settings.get('/', async (c) => {
  const user = c.get('user');
  try {
    const settings = await c.env.DB.prepare(
      'SELECT settings FROM settings WHERE user_id = ?'
    ).bind(user.id).first();
    if (!settings) {
      return c.json({ initialSettings });
    }
    return c.json(JSON.parse(settings.settings as string));
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to load settings' }, 500);
  }
});

settings.post('/', async (c) => {
  const user = c.get('user');
  try {
    const newSettings = await c.req.json();
    await c.env.DB.prepare(
      `INSERT INTO settings (user_id, settings)
       VALUES (?, ?)
       ON CONFLICT(user_id) DO UPDATE SET settings = excluded.settings`
    ).bind(user.id, JSON.stringify(newSettings)).run();
    return c.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to save settings' }, 500);
  }
});

export default settings;
