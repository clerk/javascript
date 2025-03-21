import { Outlet, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/chrome-extension";
import { NavBar } from "~components/nav-bar";

const PUBLISHABLE_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY
const SYNC_HOST = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST

if (!PUBLISHABLE_KEY || !SYNC_HOST) {
  throw new Error('Please add the PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY and PLASMO_PUBLIC_CLERK_SYNC_HOST to the .env.development file')
}

export const RootLayout = () => {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      syncHost={SYNC_HOST}
      debug
      __experimental_syncHostListener
    >
      <div className="plasmo-w-[785px] plasmo-h-[600px] plasmo-flex plasmo-flex-col plasmo-bg-black plasmo-text-white">
        <main className="plasmo-grow plasmo-h-[543px]">
          <Outlet />
        </main>
        <footer className="plasmo-fixed plasmo-bottom-0 plasmo-w-full">
          <NavBar />
        </footer>
      </div>
    </ClerkProvider>
  );
};
