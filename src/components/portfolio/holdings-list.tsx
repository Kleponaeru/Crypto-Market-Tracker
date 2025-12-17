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
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`
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
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}`
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
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Loading holdings...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error && holdings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
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
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No holdings yet. Add your first transaction to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Holdings</CardTitle>
        {error && <p className="text-xs text-muted-foreground mt-1">{error}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {holdings.map((holding) => (
            <div
              key={holding.coinId}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/50 transition"
            >
              <div className="flex items-center gap-3 flex-1">
                {holding.coinImage && (
                  <Image
                    src={holding.coinImage}
                    alt={holding.coinName}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{holding.coinName}</h3>
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

              <div className="text-right space-y-1">
                <div className="font-semibold">
                  {formatCurrency(holding.currentValue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  @ {formatCurrency(holding.currentPrice)}
                </div>
              </div>

              <div className="text-right ml-6 min-w-[100px]">
                <div
                  className={`font-semibold ${
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
