import { Bitcoin } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/dashboard" aria-label="PonCoin home" className="group inline-flex cursor-pointer items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105 motion-reduce:transform-none">
        <Bitcoin className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-bold tracking-[0.08em]">
        PONCOIN
      </span>
    </Link>
  );
}
