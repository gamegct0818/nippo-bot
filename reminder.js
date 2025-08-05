import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// LINEユーザーID（リマインド送信先）
const USER_ID = "ここにあなたのLINEのユーザーIDを入れてください";

// メッセージ内容
const message = {
  to: USER_ID,
  messages: [
    {
      type: "text",
      text: "⏰ 日報の時間です！今日の業務を入力してください。"
    }
  ]
};

// プッシュメッセージ送信
axios.post("https://api.line.me/v2/bot/message/push", message, {
  headers: {
    Authorization: `Bearer ${process.env.LINE_CHANNEL_TOKEN}`,
    "Content-Type": "application/json"
  }
})
.then(() => {
  console.log("リマインド送信成功");
})
.catch((error) => {
  console.error("リマインド送信エラー:", error.response?.data || error.message);
});
