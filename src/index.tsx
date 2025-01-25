import { Hono } from 'hono'
import { renderToString } from 'react-dom/server'
import { authHandler, verifyAuth } from '@hono/auth-js'
import { authConfig, userMiddleware } from './middlewares/auth'
import beans from './api/users/beans'
import brews from './api/users/brews'
import analyze from './api/users/analyze'
import settings from './api/users/settings'
import images from './api/users/images'
import tags from './api/users/tags'

export interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
  MAME_LOG_IMAGES: KVNamespace;
  HOST_NAME: string;
  AUTH_SECRET: string;
  AUTH_GOOGLE_ID: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', async (c, next) => {
  const auth = authConfig(c);
  await auth(c, next);
});

app.use('/api/auth/*', authHandler());

app.use('/api/*', verifyAuth())
app.use('/api/users/*', userMiddleware);
app.route('/api/users/beans', beans)
app.route('/api/users/brews', brews)
app.route('/api/users/analyze', analyze)
app.route('/api/users/settings', settings)
app.route('/api/users/images/*', images)
app.route('/api/users/tags', tags)

app.get('*', (c) => {
  return c.html(
    renderToString(
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          {import.meta.env.PROD ? (
            <>
              <link rel="stylesheet" href="/static/assets/style.css" />
              <script type="module" src="/static/client.js"></script>
            </>
          ) : (
            <>
              <link rel="stylesheet" href="/src/style.css" />
              <script type="module" src="/src/client.tsx"></script>
            </>
          )}
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    )
  )
})

export default app