import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestedIds = new URL(request.url).searchParams.get("ids");
  const ids = requestedIds?.split(",").map((id) => id.trim()).filter(Boolean) ?? [];

  if (!ids.length || ids.length > 100 || ids.some((id) => !/^[a-z0-9-]+$/i.test(id))) {
    return NextResponse.json({ error: "Provide between 1 and 100 valid coin IDs" }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({ ids: ids.join(","), vs_currencies: "usd" });
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`,
      {
        headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY || "" },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch coin prices" }, { status: response.status });
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ error: "Unable to reach CoinGecko" }, { status: 502 });
  }
}
