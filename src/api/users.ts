import { Hono } from 'hono';
import { Env } from '../index';

const users = new Hono<{ Bindings: Env }>();

// Handle new user creation and agreement to terms
users.post('/', async (c) => {
  try {
    // Extract user information from the request context
    const auth = c.get('authUser');

    if (!auth || !auth.token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { sub, email, name = null, picture = null } = auth.token;

    if (!sub || !email) {
      return c.json({ error: 'Invalid user information' }, 400);
    }

    const db = c.env.DB;

    // Check if the user already exists
    const existingUser = await db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existingUser) {
      return c.json({ message: 'User already exists' });
    }

    // Insert new user into the database
    await db
      .prepare(
        `INSERT INTO users (sub, email, name, photo_url, terms_agreed_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
      )
      .bind(sub, email, name, picture)
      .run();

    return c.redirect('/');

  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default users;
