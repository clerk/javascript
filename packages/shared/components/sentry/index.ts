declare global {
  interface Window {
    Sentry: typeof import('@sentry/browser');
  }
}

export * from './SentryLazy';
