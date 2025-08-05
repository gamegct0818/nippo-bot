import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const events = req.body.events;
  if (!events || events.length === 0) {
    return res.status(200).send("No events");
  }

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text;

      // OpenAI APIに問い合わせて日報文を生成
      const completion = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "あなたは飲食事業部に所属するビジネスパーソンです。与えられた業務内容をもとに、以下の条件で自然な業務日報を400字程度で作成してください：\n\n- 見出し（例：【日報】）は不要です\n- 午前・午後などの時系列区切りは不要です\n- 丁寧で整理された自然な文章で要点をまとめる\n- トラブル対応や所感なども含めて柔軟に表現する"
            },
            {
              role: "user",
              content: `以下の業務内容をもとに、自然な日報文を400字程度で書いてください：\n${userMessage}`
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const replyText = completion.data.choices[0].message.content;

      // LINEに返信
      await axios.post(
        "https://api.line.me/v2/bot/message/reply",
        {
          replyToken: event.replyToken,
          messages: [
            {
              type: "text",
              text: replyText
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.LINE_CHANNEL_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
    }
  }

  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
