import { MiddlewareHandler } from 'hono';
import { Context } from 'hono';

export const requireUserMiddleware: MiddlewareHandler = async (c: Context, next) => {
  try {
    // Extract authUser from the context
    const auth = c.get('authUser');

    if (!auth || !auth.token) {
      // If user is not authenticated, redirect to the terms agreement page
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { email } = auth.token;

    // Check if the user exists in the database
    const db = c.env.DB;
    const existingUser = await db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (!existingUser) {
      // Redirect to the terms agreement page if user does not exist
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Set the user in the context for downstream handlers
    c.set('user', existingUser);

    await next();
  } catch (error) {
    console.error('Error in requireUserMiddleware:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
};
