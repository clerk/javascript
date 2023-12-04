import { ContentScript } from '@clerk/chrome-extension';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";
ContentScript.init(publishableKey);
