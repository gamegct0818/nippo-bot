
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const event = req.body.events?.[0];
  if (!event || event.type !== "message") return res.sendStatus(200);

  const userMessage = event.message.text;

  try {
    const openaiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [{ role: "user", content: userMessage }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const replyText = openaiRes.data.choices[0].message.content;

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken: event.replyToken,
        messages: [{ type: "text", text: replyText }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LINE_CHANNEL_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.send("OK");
  } catch (err) {
    console.error("Error:", err.message);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("Server running"));
