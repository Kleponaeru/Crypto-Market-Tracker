import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to pick up where you left off and keep an eye on your portfolio."
      footer={<>New to PonCoin? <Link href="/register" className="font-semibold text-primary transition-colors hover:text-primary/80">Create an account</Link></>}
    >
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
