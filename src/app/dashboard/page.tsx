import { PublicLayout } from "@/components/public-layout";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { TopCoins } from "@/components/dashboard/top-coins";
import { TrendingCoins } from "@/components/dashboard/trending-coins";

export default function DashboardPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Market Overview</h1>
          <p className="text-muted-foreground">
            Real-time cryptocurrency market data powered by CoinGecko
          </p>
        </div>

        <MarketOverview />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TopCoins />
          </div>
          <div>
            <TrendingCoins />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
