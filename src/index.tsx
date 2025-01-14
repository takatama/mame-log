import { Hono } from 'hono'
import { renderToString } from 'react-dom/server'
import beans from './api/beans'
import brews from './api/brews'
import analyze from './api/analyze'
import settings from './api/settings'
import { authHandler, verifyAuth } from '@hono/auth-js'
import users from './api/users'
import images from './images'
import status from './api/status'
import { authConfig, userMiddleware } from './middlewares/auth'

export interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
  MAME_LOG_IMAGES: KVNamespace;
  HOST_NAME: string;
  AUTH_SECRET: string;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', async (c, next) => {
  const auth = authConfig(c);
  await auth(c, next);
});

app.use('/api/auth/*', authHandler());

app.use('/users', verifyAuth())
app.route('/users', users)

app.use('/api/*', verifyAuth())
app.use('/api/*', userMiddleware);
app.route('/api/status', status);
app.route('/api/beans', beans)
app.route('/api/brews', brews)
app.route('/api/analyze', analyze)
app.route('/api/settings', settings)
app.route('/api/images/*', images)

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