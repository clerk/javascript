"use client"

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
