import { Hono, Context } from 'hono'
import { renderToString } from 'react-dom/server'
import beans from './api/beans'
import brews from './api/brews'
import analyze from './api/analyze'
import settings from './api/settings'

export interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
  MAME_LOG_IMAGES: KVNamespace;
  HOST_NAME: string;
}

const app = new Hono<{ Bindings: Env }>();

app.route('/api/beans', beans)
app.route('/api/brews', brews)
app.route('/api/analyze', analyze)
app.route('/api/settings', settings)

app.get('/images/coffee-labels/:id', async (c: Context<{ Bindings: Env }>) => {
  try {
    const { id } = c.req.param();

    if (!id) {
      return c.json({ error: "Image ID is required" }, 400);
    }

    // KVストアのKeyを生成
    const photoKey = `/images/coffee-labels/${id}`;

    // KVストアから画像データを取得
    const imageData = await c.env.MAME_LOG_IMAGES.get(photoKey, { type: 'arrayBuffer' });
    const metadata = await c.env.MAME_LOG_IMAGES.getWithMetadata(photoKey);
    const contentType = (metadata?.metadata as { contentType?: string })?.contentType;

    if (!imageData || !contentType) {
      return c.json({ error: "Image not found" }, 404);
    }

    // 画像データを返却
    return new Response(imageData, {
      headers: {
        'Content-Type': contentType, // KVに保存されたContent-Type
        'Cache-Control': 'public, max-age=3600', // キャッシュを有効化
      },
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

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