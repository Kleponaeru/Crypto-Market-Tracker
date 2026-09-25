"use client";

import type React from "react";
import { useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords don’t match yet.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "We couldn’t create your account.");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        toast.success("Account created. Sign in to continue.");
        router.push("/login");
        return;
      }

      toast.success("Account created. Welcome to PonCoins!");
      router.push("/portfolio");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">{error}</div>}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="name" type="text" autoComplete="name" placeholder="Alex Morgan" value={name} onChange={(event) => setName(event.target.value)} required className="h-11 rounded-xl pl-10" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-11 rounded-xl pl-10" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required className="h-11 rounded-xl pl-10 pr-11" />
          <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
        <Input id="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Re-enter your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required className="h-11 rounded-xl" />
      </div>
      <Button type="submit" className="h-11 w-full cursor-pointer rounded-xl text-white shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md motion-reduce:transform-none" disabled={isLoading}>
        {isLoading ? <><LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />Creating account…</> : "Create account"}
      </Button>
      <p className="text-center text-xs leading-5 text-muted-foreground">By creating an account, you can save and review your portfolio activity.</p>
    </form>
  );
}
