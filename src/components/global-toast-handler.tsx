// components/global-toast-handler.tsx
"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function GlobalToastHandler() {
  const searchParams = useSearchParams();
  const hasShownToast = useRef(false);

  useEffect(() => {
    const toastType = searchParams.get("toast");
    const toastMessage = searchParams.get("message");

    // Check specific toast types
    if (toastType && !hasShownToast.current) {
      hasShownToast.current = true;

      setTimeout(() => {
        switch (toastType) {
          case "success":
            toast.success(toastMessage || "Success!");
            break;
          case "error":
            toast.error(toastMessage || "Something went wrong");
            break;
          case "info":
            toast.info(toastMessage || "Info");
            break;
          case "warning":
            toast.warning(toastMessage || "Warning");
            break;
          case "login":
            toast.success("Login successful. Welcome back! 👋");
            break;
          case "logout":
            toast.success("Logged out successfully");
            break;
          default:
            toast(toastMessage || "Notification");
        }
      }, 100);

      // Clean up URL parameters
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("toast");
        url.searchParams.delete("message");
        window.history.replaceState({}, "", url.toString());
      }, 500);
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
}
