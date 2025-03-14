import { initAuthConfig } from '@hono/auth-js';
import Google from '@auth/core/providers/google';
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
          INSERT INTO users (provider_account_id, email, name, photo_url)
          VALUES (?, ?, ?, ?)
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

          // 初期化: 「お気に入り」タグを作成
          await initializeFavoriteTag(db, result.id as number);
        } else {
          console.error('Failed to upsert user information');
        }

        return token;
      },
      async session({ session, token }) {
        if (token.user_id) {
          session.user.id = token.user_id.toString();
        }
        return session;
      }
    },
  }));

export const userMiddleware: MiddlewareHandler = async (c: Context, next) => {
  try {
    const auth = c.get('authUser');
    const id = auth?.session?.user?.id;
    if (!id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('user', { id });
    await next();
  } catch (error) {
    console.error('Error in userMiddleware:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
};

/**
 * 初期化: 「お気に入り」タグを作成
 */
const initializeFavoriteTag = async (db: D1Database, userId: number) => {
  const favoriteTagName = {
    en: 'Favorite',
    ja: 'お気に入り',
  };

  const defaultLanguage = 'ja'; // 必要に応じて変更
  const tagName = favoriteTagName[defaultLanguage] || 'Favorite';

  const existingTag = await db
    .prepare(`SELECT id FROM tags WHERE name = ? AND user_id = ?`)
    .bind(tagName, userId)
    .first();

  if (!existingTag) {
    const insertResult = await db
      .prepare(`INSERT INTO tags (name, user_id) VALUES (?, ?)`)
      .bind(tagName, userId)
      .run();

    if (!insertResult.success) {
      console.error(`Failed to create "Favorite" tag for user ID ${userId}`);
    } else {
      console.log(`Created "Favorite" tag for user ID ${userId}`);
    }
  }
};
