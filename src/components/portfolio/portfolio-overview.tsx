"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react";
import type { Transaction } from "../../../types/transaction";

// Cache outside component to persist across unmounts/remounts
const overviewCache = {
  data: null as {
    totalValue: number;
    totalInvested: number;
    profitLoss: number;
    profitLossPercent: number;
  } | null,
  timestamp: 0,
  CACHE_DURATION: 3 * 60 * 1000, // 3 minutes
};

export function PortfolioOverview() {
  const [totalValue, setTotalValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [profitLoss, setProfitLoss] = useState(0);
  const [profitLossPercent, setProfitLossPercent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const calculatePortfolio = async (skipCache = false) => {
      try {
        if (!isMounted) return;

        // Check cache first
        const now = Date.now();
        if (
          !skipCache &&
          overviewCache.data &&
          now - overviewCache.timestamp < overviewCache.CACHE_DURATION
        ) {
          console.log("Using cached overview data");
          const cached = overviewCache.data;
          setTotalValue(cached.totalValue);
          setTotalInvested(cached.totalInvested);
          setProfitLoss(cached.profitLoss);
          setProfitLossPercent(cached.profitLossPercent);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        // 1️⃣ Fetch transactions from DB
        const res = await fetch("/api/portfolio/transaction", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch transactions");

        const transactions: Transaction[] = await res.json();

        // 2️⃣ Group by coin
        const holdings: Record<string, { amount: number; invested: number }> =
          {};

        transactions.forEach((tx) => {
          if (!holdings[tx.coinId]) {
            holdings[tx.coinId] = { amount: 0, invested: 0 };
          }

          if (tx.type === "buy") {
            holdings[tx.coinId].amount += tx.amount;
            holdings[tx.coinId].invested += tx.amount * tx.pricePerCoin;
          } else {
            holdings[tx.coinId].amount -= tx.amount;
            holdings[tx.coinId].invested -= tx.amount * tx.pricePerCoin;
          }
        });

        const coinIds = Object.keys(holdings).join(",");
        if (!coinIds) {
          if (isMounted) {
            setTotalValue(0);
            setTotalInvested(0);
            setProfitLoss(0);
            setProfitLossPercent(0);
            setIsLoading(false);
          }
          return;
        }

        console.log("Fetching fresh overview data from CoinGecko...");

        // 3️⃣ Fetch current prices
        const priceRes = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`
        );

        if (!priceRes.ok) {
          if (priceRes.status === 429) {
            // Use cached data if available
            if (overviewCache.data && isMounted) {
              const cached = overviewCache.data;
              setTotalValue(cached.totalValue);
              setTotalInvested(cached.totalInvested);
              setProfitLoss(cached.profitLoss);
              setProfitLossPercent(cached.profitLossPercent);
              return;
            }
            throw new Error("Rate limit exceeded");
          }
          throw new Error("Failed to fetch prices");
        }

        const prices = await priceRes.json();

        let currentValue = 0;
        let invested = 0;

        Object.entries(holdings).forEach(([coinId, holding]) => {
          const currentPrice = prices[coinId]?.usd ?? 0;
          currentValue += holding.amount * currentPrice;
          invested += holding.invested;
        });

        const pl = currentValue - invested;
        const plPercent = invested > 0 ? (pl / invested) * 100 : 0;

        if (isMounted) {
          setTotalValue(currentValue);
          setTotalInvested(invested);
          setProfitLoss(pl);
          setProfitLossPercent(plPercent);

          // Update cache
          overviewCache.data = {
            totalValue: currentValue,
            totalInvested: invested,
            profitLoss: pl,
            profitLossPercent: plPercent,
          };
          overviewCache.timestamp = Date.now();
        }
      } catch (err) {
        console.error("Error calculating portfolio:", err);
        // Silently use cached data if available on error
        if (overviewCache.data && isMounted) {
          const cached = overviewCache.data;
          setTotalValue(cached.totalValue);
          setTotalInvested(cached.totalInvested);
          setProfitLoss(cached.profitLoss);
          setProfitLossPercent(cached.profitLossPercent);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    calculatePortfolio();
    intervalId = setInterval(() => calculatePortfolio(true), 300_000); // 5 minutes

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

  const stats = [
    {
      title: "Total Value",
      value: formatCurrency(totalValue),
      icon: Wallet,
    },
    {
      title: "Total Invested",
      value: formatCurrency(totalInvested),
      icon: DollarSign,
    },
    {
      title: "Profit/Loss",
      value: formatCurrency(profitLoss),
      change: profitLossPercent,
      icon: profitLoss >= 0 ? TrendingUp : TrendingDown,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Loading...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.change !== undefined && (
              <div className="flex items-center gap-1 text-xs mt-1">
                {stat.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-success" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-destructive" />
                )}
                <span
                  className={
                    stat.change >= 0 ? "text-success" : "text-destructive"
                  }
                >
                  {Math.abs(stat.change).toFixed(2)}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
