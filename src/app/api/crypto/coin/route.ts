import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")?.trim();

  if (!id || !/^[a-z0-9-]+$/i.test(id)) {
    return NextResponse.json({ error: "A valid coin ID is required" }, { status: 400 });
  }

  const headers = {
    "x-cg-demo-api-key": process.env.COINGECKO_API_KEY || "",
  };

  try {
    const [coinResponse, chartResponse] = await Promise.all([
      fetch(
        `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=true`,
        { headers, next: { revalidate: 60 } }
      ),
      fetch(
        `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=7`,
        { headers, next: { revalidate: 300 } }
      ),
    ]);

    if (!coinResponse.ok) {
      return NextResponse.json(
        { error: coinResponse.status === 404 ? "Coin not found" : "Failed to fetch coin data" },
        { status: coinResponse.status }
      );
    }

    const coin = await coinResponse.json();
    const chart = chartResponse.ok
      ? await chartResponse.json()
      : { prices: [], market_caps: [], total_volumes: [] };

    return NextResponse.json({ coin, chart });
  } catch {
    return NextResponse.json({ error: "Unable to reach CoinGecko" }, { status: 502 });
  }
}
