import { MiddlewareHandler } from 'hono';
import { Context } from 'hono';

export const requireUserMiddleware: MiddlewareHandler = async (c: Context, next) => {
  try {
    // Extract authUser from the context
    const auth = c.get('authUser');

    if (!auth || !auth.token) {
      // If user is not authenticated, redirect to the terms agreement page
      return c.redirect('/users/new');
    }

    const { sub } = auth.token;

    // Check if the user exists in the database
    const db = c.env.DB;
    const existingUser = await db
      .prepare('SELECT * FROM users WHERE sub = ?')
      .bind(sub)
      .first();

    if (!existingUser) {
      // Redirect to the terms agreement page if user does not exist
      return c.redirect('/api/users/new');
    }

    // Set the user in the context for downstream handlers
    c.set('user', existingUser);

    await next();
  } catch (error) {
    console.error('Error in requireUserMiddleware:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
};