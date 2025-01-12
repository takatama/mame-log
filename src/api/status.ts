import { Hono, Context } from 'hono'
import { Env } from '../index'

const status = new Hono<{ Bindings: Env }>();
status.get('/', async (c: Context<{ Bindings: Env }>) => {
  try {
    // Extract authUser from the context
    const auth = c.get('authUser');

    if (!auth || !auth.token) {
      // If user is not authenticated, redirect to the terms agreement page
      return c.json({ isSignedIn: false });
    }

    const { email } = auth.token;

    // Check if the user exists in the database
    const db = c.env.DB;
    const existingUser = await db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (!existingUser) {
      return c.json({ isSignedIn: true, isRegistered: false });
    }
    return c.json({ isSignedIn: true, isRegistered: true });
  } catch (error) {
    console.error('Error in auth:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
});

export default status;