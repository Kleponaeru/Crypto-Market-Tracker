import { Bitcoin } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
        <Bitcoin />
      </div>
      <span className="text-2xl font-bold">CryptoTracker</span>
    </div>
  );
}
