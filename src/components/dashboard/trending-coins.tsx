import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TrendingCoin } from "@/types/market";

interface TrendingCoinsProps {
  coins: TrendingCoin[];
  loading: boolean;
}

export function TrendingCoins({ coins, loading }: TrendingCoinsProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-orange-500/10 p-2 text-orange-600 dark:text-orange-400">
              <Flame className="size-4" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">Trending searches</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Assets gaining attention on CoinGecko</p>
        </div>
        <span className="shrink-0 rounded-full bg-orange-500/10 px-2.5 py-1 text-[11px] font-medium text-orange-700 dark:text-orange-300">Now</span>
      </div>
      <CardContent className="p-2 sm:p-3">
        <ol className="divide-y divide-border/60">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <li key={index} className="flex items-center gap-3 p-3">
                <div className="size-7 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                <div className="flex-1 space-y-2"><div className="h-3 w-28 animate-pulse rounded bg-muted motion-reduce:animate-none" /><div className="h-3 w-16 animate-pulse rounded bg-muted motion-reduce:animate-none" /></div>
              </li>
            ))
          ) : coins.length ? (
            coins.slice(0, 7).map(({ item }, index) => (
              <li key={item.id}>
                <Link
                  href={`/coin/${item.id}`}
                  className="group flex min-h-16 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <span className="w-5 shrink-0 text-center text-xs font-medium tabular-nums text-muted-foreground">{index + 1}</span>
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
                    <Image src={item.small} alt="" fill sizes="36px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.name}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="uppercase">{item.symbol}</span>
                      {item.market_cap_rank && <span>Rank #{item.market_cap_rank}</span>}
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" aria-hidden="true" />
                </Link>
              </li>
            ))
          ) : (
            <li className="px-3 py-10 text-center text-sm text-muted-foreground">Trending searches are unavailable right now.</li>
          )}
        </ol>
      </CardContent>
      <div className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
        Based on CoinGecko search activity
      </div>
    </Card>
  );
}
