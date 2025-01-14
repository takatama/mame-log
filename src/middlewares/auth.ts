import { initAuthConfig } from '@hono/auth-js';
import Google from '@auth/core/providers/google'
import { Context, MiddlewareHandler } from 'hono';
import { Env } from '../index';

export const authConfig = (c: Context<{ Bindings: Env }>) =>
  initAuthConfig(() => ({
    secret: c.env.AUTH_SECRET,
    providers: [Google],
    callbacks: {
      async jwt({ token, account, user }) {
        const db = c.env.DB;

        const providerAccountId = account?.providerAccountId;
        if (!providerAccountId) {
          // console.error('Missing required user information');
          return token;
        }

        // ユーザー情報をDBに保存し、user_idをJWTトークンに追加
        const query = `
          INSERT INTO users (provider_account_id, email, name, photo_url, terms_agreed_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(provider_account_id) DO UPDATE SET
              email = excluded.email,
              name = excluded.name,
              photo_url = excluded.photo_url
          RETURNING id;
        `;

        const result = await db
          .prepare(query)
          .bind(providerAccountId, user?.email || '', user?.name || '', user?.image || '')
          .first();

        if (result?.id) {
          token.user_id = result.id;
          console.log("token", token)
        } else {
          console.error('Failed to upsert user information');
        }

        return token;
      },
    },
  }))

export const userMiddleware: MiddlewareHandler = async (c: Context, next) => {
  try {
    // Extract authUser from the context
    const auth = c.get('authUser');
    const user_id = auth?.token?.user_id as number;
    if (!user_id) {
      // If user is not authenticated, redirect to the terms agreement page
      return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('user', { id: user_id });

    await next();
  } catch (error) {
    console.error('Error in requireUserMiddleware:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
};