"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  LayoutDashboard,
  Wallet,
  LogIn,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Portfolio", href: "/portfolio", icon: Wallet },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5 lg:gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === item.href || pathname.startsWith("/coin/")
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="cursor-pointer bg-transparent transition-colors duration-200 hover:bg-secondary hover:text-foreground"
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {status === "loading" ? (
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex"
              disabled
            >
              Loading...
            </Button>
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Open account menu"
                  className="cursor-pointer bg-transparent hover:bg-secondary hover:text-foreground"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  <span className="hidden max-w-32 truncate sm:inline">{session.user.name || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link
                    href="/portfolio"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    My portfolio
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="
                    flex items-center gap-2 cursor-pointer
                    text-destructive
                    bg-transparent
                    data-[highlighted]:bg-secondary
                    data-[highlighted]:text-destructive
                    focus:bg-secondary
                    focus:text-destructive
                  "
                  onClick={() =>
                    signOut({ callbackUrl: "/dashboard?toast=logout" })
                  }
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm" className="text-white">
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="border-t border-border/70 bg-background/95 md:hidden">
        <nav className="flex items-center justify-around py-2 px-4">
          {navigation.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === item.href || pathname.startsWith("/coin/")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-w-20 cursor-pointer flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors duration-200",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
