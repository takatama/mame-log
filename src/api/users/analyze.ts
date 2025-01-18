
import { Hono, Context } from 'hono'
import { Env } from '../../index'

const app = new Hono<{ Bindings: Env }>();

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
- メモ (notes)

出力形式はJSONでお願いします。含まれていない項目はNULLではなく""にしてください。
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

app.post('/', async (c: Context<{ Bindings: Env }>) => {
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

export default app
