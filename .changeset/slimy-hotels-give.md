---
'@clerk/tanstack-react-start': minor
'@clerk/react-router': minor
'@clerk/clerk-js': minor
'@clerk/nextjs': minor
'@clerk/shared': minor
'@clerk/astro': minor
'@clerk/react': minor
'@clerk/nuxt': minor
'@clerk/vue': minor
---

Add standalone `getToken()` function for retrieving session tokens outside of framework component trees.

This function is safe to call from anywhere in the browser, such as API interceptors, data fetching layers (e.g., React Query, SWR), or vanilla JavaScript code. It automatically waits for Clerk to initialize before returning the token.

import { getToken } from '@clerk/nextjs'; // or any framework package

// Example: Axios interceptor
axios.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
