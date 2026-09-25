import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ coins: [] });
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          "x-cg-demo-api-key": process.env.COINGECKO_API_KEY || "",
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "CoinGecko search is temporarily unavailable" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ coins: (data.coins ?? []).slice(0, 15) });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach CoinGecko search" },
      { status: 502 }
    );
  }
}
