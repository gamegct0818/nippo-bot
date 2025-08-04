
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// Webhookエンドポイント
app.post("/webhook", async (req, res) => {
  console.log("LINE Webhook received:", req.body);
  res.status(200).send("OK"); // ✅ LINEに即レスしないとタイムアウト

  // ここにGPT処理を追加（非同期でOK）
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

export default app;
