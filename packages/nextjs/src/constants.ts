const Headers = {
  NextRewrite: 'x-middleware-rewrite',
  NextResume: 'x-middleware-next',
  NextRedirect: 'Location',
  // Used by next to identify internal navigation for app router
  NextUrl: 'next-url',
  NextAction: 'next-action',
  // Used by next to identify internal navigation for pages router
  NextjsData: 'x-nextjs-data',
} as const;

export const constants = {
  Headers,
} as const;
