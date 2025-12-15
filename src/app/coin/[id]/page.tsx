"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Globe,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "@/components/public-header";

interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: { large: string };
  market_cap_rank: number;
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    price_change_percentage_1y: number;
    ath: { usd: number };
    ath_date: { usd: string };
    atl: { usd: number };
    atl_date: { usd: string };
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
  };
  description: { en: string };
  links: {
    homepage: string[];
    blockchain_site: string[];
  };
}

export default function CoinDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoinDetail = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${params.id}?localization=false&tickers=false&community_data=false&developer_data=false`
        );
        const data = await response.json();
        setCoin(data);
      } catch (error) {
        console.error("Error fetching coin details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCoinDetail();
    }
  }, [params.id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  const formatMarketCap = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20 text-muted-foreground">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Coin not found</p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-transparent hover:bg-secondary dark:hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="bg-transparent hover:bg-secondary dark:hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 relative flex-shrink-0">
              <Image
                src={coin.image.large || "/placeholder.svg"}
                alt={coin.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-bold">{coin.name}</h1>
                <span className="text-xl text-muted-foreground uppercase">
                  {coin.symbol}
                </span>
                <span className="px-2 py-1 bg-muted rounded text-sm">
                  Rank #{coin.market_cap_rank}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {coin.links.homepage[0] && (
                  <Link
                    href={coin.links.homepage[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="pt-0">
              <div className="flex items-baseline gap-3 flex-wrap">
                <div className="text-4xl md:text-5xl font-bold">
                  {formatCurrency(coin.market_data.current_price.usd)}
                </div>
                <div
                  className={`flex items-center gap-1 text-xl font-medium ${
                    coin.market_data.price_change_percentage_24h >= 0
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {coin.market_data.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  {Math.abs(
                    coin.market_data.price_change_percentage_24h
                  ).toFixed(2)}
                  %
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Market Cap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMarketCap(coin.market_data.market_cap.usd)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  24h Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMarketCap(coin.market_data.total_volume.usd)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Circulating Supply
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(coin.market_data.circulating_supply)}{" "}
                  {coin.symbol.toUpperCase()}
                </div>
                {coin.market_data.max_supply && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Max: {formatNumber(coin.market_data.max_supply)}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  24h Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Low: </span>
                    {formatCurrency(coin.market_data.low_24h.usd)}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">High: </span>
                    {formatCurrency(coin.market_data.high_24h.usd)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Price Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">24 Hours</div>
                  <div
                    className={`text-xl font-medium ${
                      coin.market_data.price_change_percentage_24h >= 0
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {coin.market_data.price_change_percentage_24h >= 0
                      ? "+"
                      : ""}
                    {coin.market_data.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">7 Days</div>
                  <div
                    className={`text-xl font-medium ${
                      coin.market_data.price_change_percentage_7d >= 0
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {coin.market_data.price_change_percentage_7d >= 0
                      ? "+"
                      : ""}
                    {coin.market_data.price_change_percentage_7d.toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">30 Days</div>
                  <div
                    className={`text-xl font-medium ${
                      coin.market_data.price_change_percentage_30d >= 0
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {coin.market_data.price_change_percentage_30d >= 0
                      ? "+"
                      : ""}
                    {coin.market_data.price_change_percentage_30d.toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">1 Year</div>
                  <div
                    className={`text-xl font-medium ${
                      coin.market_data.price_change_percentage_1y >= 0
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {coin.market_data.price_change_percentage_1y >= 0
                      ? "+"
                      : ""}
                    {coin.market_data.price_change_percentage_1y.toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>All-Time High</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold">
                  {formatCurrency(coin.market_data.ath.usd)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(coin.market_data.ath_date.usd)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All-Time Low</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold">
                  {formatCurrency(coin.market_data.atl.usd)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(coin.market_data.atl_date.usd)}
                </div>
              </CardContent>
            </Card>
          </div>

          {coin.description.en && (
            <Card>
              <CardHeader>
                <CardTitle>About {coin.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: coin.description.en }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
