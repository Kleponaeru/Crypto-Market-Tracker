import { RegisterForm } from "@/components/auth/register-form";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <Logo />
          <h1 className="text-3xl font-bold text-balance">Create an account</h1>
          <p className="text-muted-foreground text-center text-balance">
            Start tracking your crypto portfolio today
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
