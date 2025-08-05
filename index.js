export default async function handler(req, res) {
  const body = req.body;

  // 署名検証は省略（本番では必要）
  if (body.events && body.events.length > 0) {
    const event = body.events[0];

    // ここで userId をログ出力
    console.log("🔍 userId:", event.source?.userId);

    // 応答はとりあえず何もしない
    res.status(200).send("OK");
  } else {
    res.status(200).send("No events");
  }
}
