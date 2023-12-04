import React from 'react';
import { useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/chrome-extension";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

export type AuthProviderProps = {
  children: React.ReactNode,
  syncSessionWithTab?: boolean
}

export function AuthProvider(props: AuthProviderProps) {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      routerPush={to => navigate(to)}
      routerReplace={to => navigate(to, { replace: true })}
      {...props}
    />
  )
}

