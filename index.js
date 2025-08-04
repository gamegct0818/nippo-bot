
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const LINE_CHANNEL_TOKEN = process.env.LINE_CHANNEL_TOKEN;

app.post("/webhook", async (req, res) => {
  res.status(200).send("OK");

  const events = req.body.events;
  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const replyText = `受け取りました: ${event.message.text}`;

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
    }
  }
});

export default app;
