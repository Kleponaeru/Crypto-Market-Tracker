"use client";

import type React from "react";
import { Suspense } from "react";
import { PublicHeader } from "./public-header";
import { GlobalToastHandler } from "./global-toast-handler";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <GlobalToastHandler />
      </Suspense>
      <div className="flex min-h-screen flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </>
  );
}
