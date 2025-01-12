import { Hono } from 'hono';
import { Env } from '../index';
import { DefaultBrewSettings as initialSettings } from '../settings/DefaultBrewSettings';

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
  const user = c.get('user'); // ユーザー情報を取得
  try {
    const newSettings = await c.req.json();
    // ユーザーごとの設定を保存
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO settings (user_id, settings) VALUES (?, ?)'
    )
      .bind(user.id, JSON.stringify(newSettings)) // user.id を利用
      .run();
    return c.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to save settings' }, 500);
  }
});

export default settings;
