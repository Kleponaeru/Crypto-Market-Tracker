"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

interface MarketData {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  marketCapChange: number;
}

export function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch("/api/crypto/global");
        const data = await response.json();

        setMarketData({
          totalMarketCap: data.data.total_market_cap.usd,
          totalVolume: data.data.total_volume.usd,
          btcDominance: data.data.market_cap_percentage.btc,
          marketCapChange: data.data.market_cap_change_percentage_24h_usd,
        });
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const stats = [
    {
      title: "Total Market Cap",
      value: marketData ? formatCurrency(marketData.totalMarketCap) : "-",
      change: marketData?.marketCapChange,
      icon: DollarSign,
    },
    {
      title: "24h Volume",
      value: marketData ? formatCurrency(marketData.totalVolume) : "-",
      icon: Activity,
    },
    {
      title: "BTC Dominance",
      value: marketData ? `${marketData.btcDominance.toFixed(1)}%` : "-",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "-" : stat.value}
            </div>
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
                <span className="text-muted-foreground">24h</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
