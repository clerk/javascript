import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  // or cloudflare, deno, etc.
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [remix({
    serverModuleFormat: 'cjs',
    future: {
      v3_fetcherPersist: true,
      v3_relativeSplatPath: true,
      v3_throwAbortReason: true,
      v3_lazyRouteDiscovery: true,
      v3_singleFetch: true,
      unstable_routeConfig: true,
    }
  }), tsconfigPaths()],
});
