import { Hono } from 'hono';
import { Env } from '../index';

const settings = new Hono<{ Bindings: Env }>();

settings.get('/', async (c) => {
  try {
    const settings = await c.env.DB.prepare('SELECT settings FROM settings WHERE id = 1').first();
    if (!settings) {
      return c.json({ error: 'Settings not found' }, 404);
    }
    return c.json(JSON.parse(settings.settings as string));
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to load settings' }, 500);
  }
});

settings.post('/', async (c) => {
  try {
    const newSettings = await c.req.json();
    await c.env.DB.prepare('INSERT OR REPLACE INTO settings (id, settings) VALUES (1, ?)').bind(JSON.stringify(newSettings)).run();
    return c.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to save settings' }, 500);
  }
});

export default settings;
