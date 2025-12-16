"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  Settings,
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
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
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
            className="bg-transparent hover:bg-secondary dark:hover:bg-secondary hover:text-foreground"
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
                  className="hidden cursor-pointer sm:flex bg-transparent hover:bg-secondary dark:hover:bg-secondary hover:text-foreground"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {session.user.name}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild className="">
                  <Link
                    href="/settings"
                    className="
                      flex items-center gap-2 cursor-pointer
                      bg-transparent
                      data-[highlighted]:bg-secondary
                      data-[highlighted]:text-foreground
                      focus:bg-secondary
                      focus:text-foreground
                    "
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

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
                  onClick={() => signOut({ callbackUrl: "/dashboard" })}
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
      <div className="md:hidden border-t border-border">
        <nav className="flex items-center justify-around py-2 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
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
