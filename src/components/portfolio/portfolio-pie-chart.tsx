"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Transaction } from "../../../types/transaction";

interface ChartData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  [key: string]: string | number; // Index signature for Recharts
}

const COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#6366f1", // indigo
  "#ef4444", // red
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
];

// Cache outside component
const chartCache = {
  data: null as { chartData: ChartData[]; totalValue: number } | null,
  timestamp: 0,
  CACHE_DURATION: 3 * 60 * 1000, // 3 minutes
};

export function PortfolioPieChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchData = async (skipCache = false) => {
      try {
        if (!isMounted) return;

        // Check cache first
        const now = Date.now();
        if (
          !skipCache &&
          chartCache.data &&
          now - chartCache.timestamp < chartCache.CACHE_DURATION
        ) {
          console.log("Using cached chart data");
          setChartData(chartCache.data.chartData);
          setTotalValue(chartCache.data.totalValue);
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
        const holdings: Record<string, { coinName: string; amount: number }> =
          {};

        transactions.forEach((tx) => {
          if (!holdings[tx.coinId]) {
            holdings[tx.coinId] = {
              coinName: tx.coinName,
              amount: 0,
            };
          }

          if (tx.type === "buy") {
            holdings[tx.coinId].amount += tx.amount;
          } else {
            holdings[tx.coinId].amount -= tx.amount;
          }
        });

        // Filter out zero holdings
        const activeHoldings = Object.entries(holdings).filter(
          ([_, holding]) => holding.amount > 0
        );

        if (activeHoldings.length === 0) {
          if (isMounted) {
            setChartData([]);
            setTotalValue(0);
          }
          return;
        }

        const coinIds = activeHoldings.map(([id]) => id).join(",");

        console.log("Fetching fresh chart data from CoinGecko...");

        // 3️⃣ Fetch current prices
        const priceRes = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`
        );

        if (!priceRes.ok) {
          if (priceRes.status === 429) {
            // Use cached data if available
            if (chartCache.data && isMounted) {
              setChartData(chartCache.data.chartData);
              setTotalValue(chartCache.data.totalValue);
              setError("Using cached data - rate limit exceeded");
              return;
            }
            throw new Error("Rate limit exceeded. Please wait a moment.");
          }
          throw new Error("Failed to fetch prices");
        }

        const prices = await priceRes.json();

        // 4️⃣ Calculate values
        const values = activeHoldings.map(([coinId, data]) => {
          const currentPrice = prices[coinId]?.usd ?? 0;
          return {
            name: data.coinName,
            value: data.amount * currentPrice,
          };
        });

        const total = values.reduce((sum, item) => sum + item.value, 0);

        // 5️⃣ Create chart data with percentages
        const data: ChartData[] = values
          .map((item, index) => ({
            name: item.name,
            value: item.value,
            percentage: (item.value / total) * 100,
            color: COLORS[index % COLORS.length],
          }))
          .sort((a, b) => b.value - a.value);

        if (isMounted) {
          setChartData(data);
          setTotalValue(total);

          // Update cache
          chartCache.data = { chartData: data, totalValue: total };
          chartCache.timestamp = Date.now();
        }
      } catch (err: any) {
        console.error("Error fetching chart data:", err);
        if (isMounted) {
          // Use cached data if available on error
          if (chartCache.data) {
            setChartData(chartCache.data.chartData);
            setTotalValue(chartCache.data.totalValue);
            setError("Using cached data - " + err.message);
          } else {
            setError(err.message || "Failed to load distribution");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    intervalId = setInterval(() => fetchData(true), 300_000); // 5 minutes

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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Loading distribution...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error && chartData.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-destructive">{error}</p>
          <p className="text-center text-muted-foreground text-sm mt-2">
            Please wait a few minutes and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No holdings to display. Add your first transaction to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total Value: {formatCurrency(totalValue)}
        </p>
        {error && <p className="text-xs text-muted-foreground mt-1">{error}</p>}
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) =>
                    `${props.percentage?.toFixed(1) ?? "0"}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(item.value)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.percentage.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
