"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { TopCoins } from "@/components/dashboard/top-coins";
import { TrendingCoins } from "@/components/dashboard/trending-coins";
import type {
  GlobalMarketData,
  MarketCoin,
  TrendingCoin,
} from "@/types/market";

export function MarketDashboard() {
  const [globalData, setGlobalData] = useState<GlobalMarketData["data"] | null>(null);
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [trending, setTrending] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const refresh = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);

    const results = await Promise.allSettled([
      fetch("/api/crypto/global", { cache: "no-store" }),
      fetch("/api/crypto/markets", { cache: "no-store" }),
      fetch("/api/crypto/trending", { cache: "no-store" }),
    ]);
    const messages: string[] = [];

    if (results[0].status === "fulfilled" && results[0].value.ok) {
      const json = (await results[0].value.json()) as GlobalMarketData;
      setGlobalData(json.data);
    } else {
      messages.push("Global market data is unavailable.");
    }

    if (results[1].status === "fulfilled" && results[1].value.ok) {
      setCoins((await results[1].value.json()) as MarketCoin[]);
    } else {
      messages.push("Coin prices are unavailable.");
    }

    if (results[2].status === "fulfilled" && results[2].value.ok) {
      const json = await results[2].value.json();
      setTrending((json.coins ?? []) as TrendingCoin[]);
    } else {
      messages.push("Trending data is unavailable.");
    }

    setErrors(messages);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 pb-10">
      <section className="flex flex-col gap-5 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-50 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Live market data
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Market overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            A clear view of the crypto market, leading assets, and what traders
            are watching right now.
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="text-right text-xs text-muted-foreground">
            <div className="flex items-center justify-end gap-1.5">
              <Activity className="size-3.5" />
              CoinGecko
            </div>
            <div className="mt-1">
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Connecting…"}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refresh(true)}
            disabled={refreshing}
            className="cursor-pointer gap-2 bg-card shadow-sm transition-colors duration-200"
          >
            <RefreshCw
              className={`size-4 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </section>

      {errors.length > 0 && (
        <div
          role="status"
          className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-800 dark:text-amber-300"
        >
          {errors.join(" ")} Check your CoinGecko API key or try refreshing.
        </div>
      )}

      <MarketOverview data={globalData} loading={loading} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <TopCoins coins={coins} loading={loading} />
        <TrendingCoins coins={trending} loading={loading} />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Market information provided by CoinGecko. Prices may be delayed.
      </p>
    </div>
  );
}
