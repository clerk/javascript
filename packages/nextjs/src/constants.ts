const Headers = {
  NextRewrite: 'x-middleware-rewrite',
  NextResume: 'x-middleware-next',
  NextRedirect: 'Location',
  NextUrl: 'next-url',
  NextAction: 'next-action',
} as const;

export const constants = {
  Headers,
} as const;
