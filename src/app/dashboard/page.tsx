import { PublicLayout } from "@/components/public-layout";
import { MarketDashboard } from "@/components/dashboard/market-dashboard";

export default function DashboardPage() {
  return (
    <PublicLayout>
      <MarketDashboard />
    </PublicLayout>
  );
}
