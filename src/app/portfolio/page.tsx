import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PublicLayout } from "@/components/public-layout";
import { PortfolioContent } from "@/components/portfolio/portfolio-content";

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?redirect=/portfolio");
  }

  return (
    <PublicLayout>
      <PortfolioContent />
    </PublicLayout>
  );
}
