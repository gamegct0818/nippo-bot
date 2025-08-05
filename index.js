
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const LINE_CHANNEL_TOKEN = process.env.LINE_CHANNEL_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/webhook", async (req, res) => {
  res.status(200).send("OK");

  const events = req.body.events;
  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userText = event.message.text;
      console.log("User message:", userText);

      try {
        const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "あなたは日報を作成するアシスタントです。内容を400字程度でまとめてください。" },
              { role: "user", content: `今日の業務: ${userText}` }
            ]
          })
        });

        const gptData = await gptResponse.json();
        console.log("GPT Response:", gptData);

        const report = gptData.choices?.[0]?.message?.content || "エラー: GPT応答がありません";
        console.log("Generated Report:", report);

        await fetch("https://api.line.me/v2/bot/message/reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LINE_CHANNEL_TOKEN}`
          },
          body: JSON.stringify({
            replyToken: event.replyToken,
            messages: [{ type: "text", text: report }]
          })
        });
        console.log("LINE返信完了");
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }
});

export default app;
