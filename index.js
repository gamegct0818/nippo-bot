
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const LINE_CHANNEL_TOKEN = process.env.LINE_CHANNEL_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// LINE Webhook
app.post("/webhook", async (req, res) => {
  res.status(200).send("OK"); // 即レスでタイムアウト回避

  const events = req.body.events;
  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text;

      // GPTに送るプロンプト
      const prompt = `以下の内容を基に、400文字程度の日報を作成してください。\n\n${userMessage}`;

      try {
        // OpenAI GPT API呼び出し
        const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
          })
        });
        const gptData = await gptResponse.json();
        const replyText = gptData.choices[0].message.content;

        // LINEに返信
        await fetch("https://api.line.me/v2/bot/message/reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LINE_CHANNEL_TOKEN}`
          },
          body: JSON.stringify({
            replyToken: event.replyToken,
            messages: [{ type: "text", text: replyText }]
          })
        });

      } catch (error) {
        console.error("Error:", error);
      }
    }
  }
});

export default app;
