import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PortfolioOverview } from "@/components/portfolio/portfolio-overview";
import { TransactionsList } from "@/components/portfolio/transactions-list";

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?redirect=/portfolio");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Portfolio</h1>
          <p className="text-muted-foreground">
            Track your crypto holdings and transactions
          </p>
        </div>

        <PortfolioOverview />
        <TransactionsList />
      </div>
    </DashboardLayout>
  );
}
