"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Transaction } from "../../../types/transaction";
import Image from "next/image";

interface Holding {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
  amount: number;
  invested: number;
  currentValue: number;
  currentPrice: number;
  profitLoss: number;
  profitLossPercent: number;
}

// Cache outside component to persist across unmounts/remounts
const cache = {
  data: null as Holding[] | null,
  timestamp: 0,
  CACHE_DURATION: 3 * 60 * 1000, // 3 minutes in milliseconds
};

export function HoldingsList() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchHoldings = async (skipCache = false) => {
      try {
        if (!isMounted) return;

        // Check cache first
        const now = Date.now();
        if (
          !skipCache &&
          cache.data &&
          now - cache.timestamp < cache.CACHE_DURATION
        ) {
          console.log("Using cached holdings data");
          setHoldings(cache.data);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);

        // 1️⃣ Fetch transactions
        const res = await fetch("/api/portfolio/transaction", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch transactions");

        const transactions: Transaction[] = await res.json();

        // 2️⃣ Group by coin
        const holdingsMap: Record<
          string,
          {
            coinName: string;
            coinSymbol: string;
            amount: number;
            invested: number;
          }
        > = {};

        transactions.forEach((tx) => {
          if (!holdingsMap[tx.coinId]) {
            holdingsMap[tx.coinId] = {
              coinName: tx.coinName,
              coinSymbol: tx.coinSymbol,
              amount: 0,
              invested: 0,
            };
          }

          if (tx.type === "buy") {
            holdingsMap[tx.coinId].amount += tx.amount;
            holdingsMap[tx.coinId].invested += tx.amount * tx.pricePerCoin;
          } else {
            holdingsMap[tx.coinId].amount -= tx.amount;
            holdingsMap[tx.coinId].invested -= tx.amount * tx.pricePerCoin;
          }
        });

        // Filter out zero holdings
        const activeHoldings = Object.entries(holdingsMap).filter(
          ([_, holding]) => holding.amount > 0
        );

        if (activeHoldings.length === 0) {
          if (isMounted) {
            setHoldings([]);
            cache.data = [];
            cache.timestamp = Date.now();
          }
          return;
        }

        const coinIds = activeHoldings.map(([id]) => id).join(",");

        console.log("Fetching fresh data from CoinGecko...");

        // 3️⃣ Fetch prices
        const priceRes = await fetch(
          `/api/crypto/prices?ids=${encodeURIComponent(coinIds)}`
        );

        if (!priceRes.ok) {
          if (priceRes.status === 429) {
            throw new Error(
              "Rate limit exceeded. Using cached data if available."
            );
          }
          throw new Error("Failed to fetch prices");
        }

        const prices = await priceRes.json();

        // 4️⃣ Fetch coin images
        const metaRes = await fetch(
          `/api/crypto/markets?ids=${encodeURIComponent(coinIds)}&per_page=${activeHoldings.length}&sparkline=false`
        );

        if (!metaRes.ok) {
          if (metaRes.status === 429) {
            throw new Error(
              "Rate limit exceeded. Using cached data if available."
            );
          }
          throw new Error("Failed to fetch coin data");
        }

        const meta: Array<{ id: string; image: string }> = await metaRes.json();

        const imageMap = Object.fromEntries(
          meta.map((coin) => [coin.id, coin.image])
        );

        // 5️⃣ Calculate holdings data
        const holdingsData: Holding[] = activeHoldings.map(([coinId, data]) => {
          const currentPrice = prices[coinId]?.usd ?? 0;
          const currentValue = data.amount * currentPrice;
          const profitLoss = currentValue - data.invested;
          const profitLossPercent =
            data.invested > 0 ? (profitLoss / data.invested) * 100 : 0;

          return {
            coinId,
            coinName: data.coinName,
            coinSymbol: data.coinSymbol,
            coinImage: imageMap[coinId] ?? "",
            amount: data.amount,
            invested: data.invested,
            currentValue,
            currentPrice,
            profitLoss,
            profitLossPercent,
          };
        });

        // Sort by current value (highest first)
        holdingsData.sort((a, b) => b.currentValue - a.currentValue);

        if (isMounted) {
          setHoldings(holdingsData);
          // Update cache
          cache.data = holdingsData;
          cache.timestamp = Date.now();
        }
      } catch (err: any) {
        console.error("Error fetching holdings:", err);
        if (isMounted) {
          // If we have cached data, use it despite error
          if (cache.data) {
            console.log("Using cached data due to error");
            setHoldings(cache.data);
            setError("Using cached data - " + err.message);
          } else {
            setError(err.message || "Failed to load holdings");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Fetch immediately on mount (will use cache if available)
    fetchHoldings();

    // Refresh every 5 minutes, forcing fresh data
    intervalId = setInterval(() => fetchHoldings(true), 300_000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);

  if (isLoading) {
    return (
      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardContent className="py-10">
          <p className="text-center text-muted-foreground">
            Loading holdings...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error && holdings.length === 0) {
    return (
      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardContent className="py-10">
          <p className="text-center text-destructive">{error}</p>
          <p className="text-center text-muted-foreground text-sm mt-2">
            {error.includes("Rate limit")
              ? "CoinGecko API rate limit reached. Please wait a few minutes."
              : "Please try again later."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (holdings.length === 0) {
    return (
      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardContent className="py-10">
          <p className="text-center text-muted-foreground">
            No holdings yet. Add your first transaction to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
      <CardHeader className="border-b border-border/70 px-4 py-4 sm:px-5">
        <CardTitle className="text-lg">Your holdings</CardTitle>
        {error && <p className="text-xs text-muted-foreground mt-1">{error}</p>}
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2">
          {holdings.map((holding) => (
            <div
              key={holding.coinId}
              className="grid min-w-0 gap-3 rounded-xl border border-border/60 p-3 transition-colors duration-200 hover:bg-muted/30 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5 sm:p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                {holding.coinImage && (
                  <Image
                    src={holding.coinImage}
                    alt={holding.coinName}
                    width={36}
                    height={36}
                    className="rounded-full bg-muted"
                  />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{holding.coinName}</h3>
                    <span className="text-xs text-muted-foreground uppercase">
                      {holding.coinSymbol}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatAmount(holding.amount)}{" "}
                    {holding.coinSymbol.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-left sm:block sm:text-right">
                <div className="font-semibold tabular-nums">
                  {formatCurrency(holding.currentValue)}
                </div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  @ {formatCurrency(holding.currentPrice)}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
                <div
                  className={`font-semibold tabular-nums ${
                    holding.profitLoss >= 0
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {formatCurrency(holding.profitLoss)}
                </div>
                <div
                  className={`flex items-center justify-end gap-1 text-xs ${
                    holding.profitLoss >= 0
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {holding.profitLoss >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(holding.profitLossPercent).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
