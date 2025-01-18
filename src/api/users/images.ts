import { Hono, Context } from 'hono'
import { Env } from '../../index'

const app = new Hono<{ Bindings: Env }>();

app.get('/:id', async (c: Context<{ Bindings: Env }>) => {
  try {
    const { id } = c.req.param();

    if (!id) {
      return c.json({ error: "Image ID is required" }, 400);
    }

    // 認証ユーザーの情報を取得
    const user = c.get('user');
    if (!user || !user.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // KVストアのKeyを生成
    const photoKey = `/api/users/images/coffee-labels/${id}`;

    // KVストアから画像データとメタデータを取得
    const { value: imageData, metadata } = await c.env.MAME_LOG_IMAGES.getWithMetadata(photoKey, { type: 'arrayBuffer' });
    if (!imageData || !metadata) {
      return c.json({ error: "Image not found" }, 404);
    }

    // メタデータからuser_idを取得
    const metadataUserId = (metadata as { user_id?: string })?.user_id;
    if (!metadataUserId || metadataUserId !== user.id) {
      return c.json({ error: "Unauthorized access to this image" }, 403);
    }

    // メタデータからContent-Typeを取得
    const contentType = (metadata as { contentType?: string })?.contentType;
    if (!contentType) {
      return c.json({ error: "Content-Type missing in metadata" }, 500);
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

export default app;