"use client"

import type React from "react"
import { PublicHeader } from "./public-header"

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  )
}
