import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, BarChart3, ShieldCheck, Wallet } from "lucide-react";
import { Logo } from "@/components/logo";

interface AuthShellProps {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
}

export function AuthShell({ title, description, footer, children }: AuthShellProps) {
  return (
    <main className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(430px,0.9fr)]">
      <section className="relative hidden min-h-dvh overflow-hidden bg-[#111022] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-12">
        <div className="pointer-events-none absolute -right-32 -top-40 size-[34rem] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-56 -left-40 size-[36rem] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="relative z-10 text-white"><Logo /></div>

        <div className="relative z-10 max-w-2xl py-14">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Your market, in focus
          </div>
          <h2 className="max-w-xl text-4xl font-semibold leading-[1.12] tracking-tight xl:text-5xl">
            Make sense of the market. Stay close to your portfolio.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/60">
            Follow market movements and keep your crypto positions organized in one calm, clear workspace.
          </p>

          <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              { icon: BarChart3, label: "Market trends", note: "Prices and momentum" },
              { icon: Wallet, label: "Portfolio", note: "Positions in one view" },
              { icon: ShieldCheck, label: "Your account", note: "Private by design" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <item.icon className="size-4 text-violet-300" aria-hidden="true" />
                <div className="mt-5 text-sm font-medium">{item.label}</div>
                <div className="mt-1 text-xs text-white/45">{item.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-white/40">
          <span>Market data powered by CoinGecko</span>
          <span>© {new Date().getFullYear()} PonCoins</span>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 text-center lg:hidden"><Logo /></div>
          <div className="mb-7">
            <p className="mb-2 text-sm font-medium text-primary">Your workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
            {children}
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          <Link href="/dashboard" className="mx-auto mt-7 inline-flex min-h-10 items-center justify-center gap-1 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Explore the market first <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
