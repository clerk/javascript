const Headers = {
  NextRewrite: 'x-middleware-rewrite',
  NextResume: 'x-middleware-next',
  NextRedirect: 'Location',
} as const;

export const constants = {
  Headers,
} as const;
