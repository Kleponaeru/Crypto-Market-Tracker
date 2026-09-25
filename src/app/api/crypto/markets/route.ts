import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const rawIds = requestUrl.searchParams.get("ids");
    const ids = rawIds?.split(",").map((id) => id.trim()).filter(Boolean);
    if (ids?.some((id) => !/^[a-z0-9-]+$/i.test(id)) || (ids && ids.length > 50)) {
      return NextResponse.json({ error: "Invalid coin IDs" }, { status: 400 });
    }

    const requestedPage = Number(requestUrl.searchParams.get("page") ?? "1");
    const requestedPerPage = Number(requestUrl.searchParams.get("per_page") ?? "50");
    const page = Number.isInteger(requestedPage) ? Math.max(1, Math.min(requestedPage, 1000)) : 1;
    const perPage = Number.isInteger(requestedPerPage) ? Math.max(1, Math.min(requestedPerPage, 250)) : 50;
    const params = new URLSearchParams({
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: String(perPage),
      page: String(page),
      sparkline: requestUrl.searchParams.get("sparkline") === "false" ? "false" : "true",
      price_change_percentage: "24h,7d",
    });
    if (ids?.length) params.set("ids", ids.join(","));
    const url = `https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        "x-cg-demo-api-key": process.env.COINGECKO_API_KEY!,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch CoinGecko market data" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
