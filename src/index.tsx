import { Hono } from 'hono'
import { renderToString } from 'react-dom/server'
import { Context } from 'hono';
import { z } from 'zod';

interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
  MAME_LOG_IMAGES: KVNamespace;
  HOST_NAME: string;
}

const app = new Hono<{ Bindings: Env }>();

const beanSchema = z.object({
  name: z.string(),
  country: z.string().optional(),
  area: z.string().optional(),
  drying_method: z.string().optional(),
  processing_method: z.string().optional(),
  roast_level: z.string().optional(),
  roast_date: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_amount: z.number().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
  seller: z.string().optional(),
  seller_url: z.string().optional(), // string().url() にすると空の場合にエラーになる
  photo_url: z.string().optional(),
  photo_data_url: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.number().nonnegative().optional(),
});

const brewSchema = z.object({
  brew_date: z.string(),
  bean_id: z.number().int().positive(),
  bean_amount: z.number().nonnegative().optional(),
  cups: z.number().int().nonnegative().optional(),
  grind_size: z.string().optional(),
  water_temp: z.number().nonnegative().optional(),
  bloom_water_amount: z.number().nonnegative().optional(),
  bloom_time: z.number().nonnegative().optional(),
  pours: z.array(z.number().nonnegative()).optional(),
  overall_score: z.number().nonnegative().optional(),
  bitterness: z.number().nonnegative().optional(),
  acidity: z.number().nonnegative().optional(),
  sweetness: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

app.post('/api/beans', async (c: Context<{ Bindings: Env }>) => {
  try {
    const bean = await c.req.json();
    bean.is_active = bean.is_active ? 1 : 0;
    const parsedBean = beanSchema.parse(bean);

    const {
      name = '',
      country = '',
      area = '',
      drying_method = '',
      processing_method = '',
      roast_level = '',
      roast_date = '',
      purchase_date = '',
      purchase_amount = '',
      price = 0,
      seller = '',
      seller_url = '',
      photo_url = '',
      photo_data_url = '',
      notes = '',
      is_active = 0
    } = parsedBean;

    const photoKey = photo_url || `/images/coffee-labels/${crypto.randomUUID()}.png`;

    if (photo_data_url) {
      const photoData = photo_data_url.split(",")[1]; // "data:image/png;base64,..." の形式を想定
      const photoBuffer = Buffer.from(photoData, "base64");
      const photoArrayBuffer = photoBuffer.buffer; // BufferをArrayBufferに変換
    
      await c.env.MAME_LOG_IMAGES.put(photoKey, photoArrayBuffer, {
        metadata: { contentType: "image/png" },
      });
    }

    const result = await c.env.DB.prepare(
      `INSERT INTO beans (name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photo_url, notes, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photoKey, notes, is_active)
      .run();

    const insertedBean = {
      id: result.meta.last_row_id,
      name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photo_url: photoKey, notes, is_active
    }
    return c.json(insertedBean, 201);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    } else {
      return c.json({ error: 'An unexpected error occurred' }, 400);
    }
  }
});

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

app.get('/api/beans', async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM beans').all();
    return c.json(results);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    } else {
      return c.json({ error: 'An unexpected error occurred' }, 500);
    }
  }
});

app.put('/api/beans/:id', async (c: Context<{ Bindings: Env }>) => {
  try {
    const bean = await c.req.json();
    bean.is_active = bean.is_active ? 1 : 0;
    const parsedBean = beanSchema.parse(bean);
    const { name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photo_url, photo_data_url, notes, is_active } = parsedBean;

    const photoKey = photo_url || `/images/coffee-labels/${crypto.randomUUID()}.png`;

    if (photo_data_url) {
      const photoData = photo_data_url.split(",")[1]; // "data:image/png;base64,..." の形式を想定
      const photoBuffer = Buffer.from(photoData, "base64");
      const photoArrayBuffer = photoBuffer.buffer; // BufferをArrayBufferに変換
    
      await c.env.MAME_LOG_IMAGES.put(photoKey, photoArrayBuffer, {
        metadata: { contentType: "image/png" },
      });
    }

    const updateResult = await c.env.DB.prepare(
      `UPDATE beans
       SET name = ?, country = ?, area = ?, drying_method = ?, processing_method = ?, roast_level = ?, roast_date = ?, purchase_date = ?, purchase_amount = ?, price = ?, seller = ?, seller_url = ?, photo_url = ?, notes = ?, is_active = ?
       WHERE id = ?`
    )
      .bind(name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photoKey, notes, is_active, c.req.param('id'))
      .run();

    if (!updateResult.success) {
      throw new Error('Failed to update bean');
    }

    return c.json({ message: 'Bean updated successfully' });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    } else {
      return c.json({ error: 'An unexpected error occurred' }, 400);
    }
  }
});

app.delete('/api/beans/:beanId', async (c: Context<{ Bindings: Env }>) => {
  try {
    const beanId = c.req.param('beanId');

    if (!beanId) {
      return c.json({ error: 'Bean ID is required' }, 400);
    }

    // TODO KVの写真を削除

    // `brews` を削除
    const deleteBrewsResult = await c.env.DB.prepare(
      `DELETE FROM brews WHERE bean_id = ?`
    )
      .bind(beanId)
      .run();

    if (!deleteBrewsResult.success) {
      throw new Error(`Failed to delete brews for bean ID ${beanId}`);
    }

    // `beans` を削除
    const deleteBeanResult = await c.env.DB.prepare(
      `DELETE FROM beans WHERE id = ?`
    )
      .bind(beanId)
      .run();

    if (!deleteBeanResult.success) {
      throw new Error(`Failed to delete bean with ID ${beanId}`);
    }

    return c.json({ message: `Bean with ID ${beanId} and its related brews and pours were deleted successfully` }, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      400
    );
  }
});

app.post('/api/brews', async (c) => {
  try {
    const brew = await c.req.json();
    const parsedBrew = brewSchema.parse(brew);

    const {
      brew_date,
      bean_id,
      bean_amount = 0,
      cups = 0,
      grind_size = '',
      water_temp = 0,
      bloom_water_amount = 0,
      bloom_time = 0,
      pours = [],
      overall_score = 0,
      bitterness = 0,
      acidity = 0,
      sweetness = 0,
      notes = '',
    } = parsedBrew;

    const insertResult = await c.env.DB.prepare(
      `INSERT INTO brews (brew_date, bean_id, bean_amount, cups, grind_size, water_temp, bloom_water_amount, bloom_time, pours, overall_score, bitterness, acidity, sweetness, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        brew_date,
        bean_id,
        bean_amount,
        cups,
        grind_size,
        water_temp,
        bloom_water_amount,
        bloom_time,
        JSON.stringify(pours),
        overall_score,
        bitterness,
        acidity,
        sweetness,
        notes
      )
      .run();

    if (!insertResult.success) {
      throw new Error('Failed to insert brew log');
    }

    const brew_id = insertResult.meta.last_row_id;

    const insertedBrew = { id: brew_id, ...parsedBrew };
    return c.json(insertedBrew, 201);
  } catch (error) {
    console.error(error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      400
    );
  }
});

app.put('/api/brews/:id', async (c) => {
  try {
    const brew = await c.req.json();
    const parsedBrew = brewSchema.parse(brew);

    const { brew_date, bean_id, bean_amount, cups, grind_size, water_temp, bloom_water_amount: bloom_water_amount, bloom_time, pours, overall_score, bitterness, acidity, sweetness, notes } = parsedBrew;

    const updateResult = await c.env.DB.prepare(
      `UPDATE brews
       SET brew_date = ?, bean_id = ?, bean_amount = ?, cups = ?, grind_size = ?, water_temp = ?, bloom_water_amount = ?, bloom_time = ?, pours = ?, overall_score = ?, bitterness = ?, acidity = ?, sweetness = ?, notes = ?
       WHERE id = ?`
    )
      .bind(brew_date, bean_id, bean_amount, cups, grind_size, water_temp, bloom_water_amount, bloom_time, JSON.stringify(pours), overall_score, bitterness, acidity, sweetness, notes, c.req.param('id'))
      .run();

    if (!updateResult.success) {
      throw new Error('Failed to update brew log');
    }

    return c.json({ message: 'Brew log and pours updated successfully' });
  } catch (error) {
    console.error(error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      400
    );
  }
});

app.get('/api/brews', async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM brews').all();
    const parsedResults = results.map((brew: any) => ({
      ...brew,
      pours: JSON.parse(brew.pours)
    }));
    return c.json(parsedResults);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    } else {
      return c.json({ error: 'An unexpected error occurred' }, 500);
    }
  }
});

app.delete('/api/brews/:brewId', async (c) => {
  try {
    const brewId = c.req.param('brewId');

    if (!brewId) {
      return c.json({ error: 'Brew ID is required' }, 400);
    }

    // `brews` テーブルのデータを削除
    const deleteBrewResult = await c.env.DB.prepare(
      `DELETE FROM brews WHERE id = ?`
    )
      .bind(brewId)
      .run();

    if (!deleteBrewResult.success) {
      throw new Error(`Failed to delete brew with ID ${brewId}`);
    }

    return c.json({ message: `Brew with ID ${brewId} is deleted successfully` }, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      400
    );
  }
});

async function handleGemini(base64Data: string, env: Env): Promise<Response> {
  // プロンプト：BeanFormにある項目を抽出する指示
  const prompt = `
次の画像はコーヒー豆のラベルです。
もしラベルでなければ、"is_coffee_label"をfalseに設定してください。
ラベルなら、"is_coffee_label"をfalseに設定して、以下の項目を抽出してください。
- 名前 (name)
- 国 (country)
- 地域 (area)
- 乾燥方法 (drying_method)
- 処理方法 (processing_method)
- 焙煎度 (roast_level)
- 焙煎日 (roast_date)
- 購入日 (purchase_date)
- 購入量 (purchase_amount)
- 価格 (price)
- 販売者 (seller)
- 販売者URL (seller_url)
- メモ (notes)

出力形式はJSONでお願いします。含まれていない項目はNULLではなく""にしてください。
purchase_dateとroast_dateは日付形式でお願いします。例: "2022-01-01"
`;

  const generationConfig = {
    response_mime_type: "application/json",
    response_schema: {
      type: "OBJECT",
      properties: {
        is_coffee_label: {type: "BOOLEAN"},
        name: {type: "STRING"},
        country: {type: "STRING"},
        area: {type: "STRING"},
        drying_method: {type: "STRING"},
        processing_method: {type: "STRING"},
        roast_level: {type: "STRING"},
        roast_date: {type: "STRING"},
        purchase_amount: {type: "INTEGER"},
        purchase_date: {type: "STRING"},
        price: {type: "INTEGER"},
        seller: {type: "STRING"},
        seller_url: {type: "STRING"},
        notes: {type: "STRING"}
      }
    }
  };

  const geminiRequest = {
    contents: {
      role: "",
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/png",
          },
        },
        {
          text: prompt,
        },
      ],
    },
    generationConfig,
  };

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(geminiRequest),
      }
    );

    const geminiResult: any = await geminiResponse.json();

    if (!geminiResult.candidates || geminiResult.candidates.length === 0) {
      return new Response(
        JSON.stringify({ error: "No results from Gemini." }),
        { status: 500 }
      );
    }

    const beanString = geminiResult.candidates[0].content.parts[0].text;
    console.log(beanString);
    const bean = JSON.parse(beanString);
    if (bean.purchase_amount < 0) bean.purchase_amount = 0;
    if (bean.price < 0) bean.price = 0;
    return new Response(JSON.stringify({ bean, is_coffee_label: bean?.is_coffee_label }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error with Gemini request:", error);
    return new Response("Error processing request", { status: 500 });
  }
}

app.post('/api/analyze', async (c: Context<{ Bindings: Env }>) => {
  try {
    const { image } = await c.req.json();

    if (!image) {
      return new Response("Invalid input: Image is required", {
        status: 400,
      });
    }

    // 画像データをBase64形式から抽出
    const base64Data = image.split(",")[1]; // "data:image/png;base64,..." の形式を想定

    // Geminiに処理を委任
    return await handleGemini(base64Data, c.env);
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response("Internal Server Error", { status: 500 });
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