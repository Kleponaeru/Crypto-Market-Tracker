"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TrendingCoin {
  item: {
    id: string;
    name: string;
    symbol: string;
    small: string;
    price_btc: number;
    score: number;
  };
}

export function TrendingCoins() {
  const [trending, setTrending] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/search/trending"
        );
        const data = await response.json();
        setTrending(data.coins.slice(0, 7));
      } catch (error) {
        console.error("Error fetching trending:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
    const interval = setInterval(fetchTrending, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trending
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : (
            trending.map((coin, index) => (
              <Link key={coin.item.id} href={`/coin/${coin.item.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                  <span className="text-sm text-muted-foreground w-6">
                    {index + 1}
                  </span>
                  <div className="w-8 h-8 relative flex-shrink-0">
                    <Image
                      src={coin.item.small || "/placeholder.svg"}
                      alt={coin.item.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{coin.item.name}</div>
                    <div className="text-xs text-muted-foreground uppercase">
                      {coin.item.symbol}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
