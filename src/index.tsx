import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.html(
    <html>
      <head>
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body>
        <div id="root"></div>
        {import.meta.env.PROD ? (
          <script type="module" src="/static/client.js" />
        ) : (
          <script type="module" src="/src/client.tsx" />
        )}
      </body>
    </html>
  )
})

export default app
