import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Set up your workspace to track the market and organize your crypto positions."
      footer={<>Already have an account? <Link href="/login" className="font-semibold text-primary transition-colors hover:text-primary/80">Sign in</Link></>}
    >
      <RegisterForm />
    </AuthShell>
  );
}
