import React from "react";

async function getStockData() {
  const res = await fetch(
    "https://stooq.com/q/d/l/?s=7974.jp&i=d",
    { cache: "no-store" }
  );
  const text = await res.text();

  const rows = text.split("\n").slice(1).filter(Boolean);
  const prices = rows.map((row) => {
    const [date, open, high, low, close] = row.split(",");
    return {
      date,
      close: parseFloat(close),
    };
  });

  return prices.slice(-100); // 直近100日
}

function calculateMA(data: number[], period: number) {
  return data.map((_, i, arr) => {
    if (i < period - 1) return null;
    const slice = arr.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

export default async function Home() {
  const prices = await getStockData();
  const closes = prices.map((p) => p.close);
  const ma25 = calculateMA(closes, 25);
  const ma75 = calculateMA(closes, 75);

  const current = closes[closes.length - 1];
  const currentMA75 = ma75[ma75.length - 1];

  let verdict = "様子見";
  if (current < currentMA75 * 0.95) verdict = "買い寄り";
  if (current > currentMA75 * 1.1) verdict = "割高";

  return (
    <main style={{ padding: 40 }}>
      <h1>任天堂（7974）株価チェック</h1>
      <h2>現在価格: {current} 円</h2>
      <h2>判定: {verdict}</h2>
      <p>※投資助言ではありません。</p>
    </main>
  );
}