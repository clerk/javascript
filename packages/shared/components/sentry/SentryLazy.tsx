import React from 'react';

export function SentryLazy(): JSX.Element {
  return (
    <>
      {process.env.NEXT_PUBLIC_SENTRY_DSN && (
        <script
          src={`https://js.sentry-cdn.com/${process.env.NEXT_PUBLIC_SENTRY_DSN}.min.js`}
          crossOrigin='anonymous'
          // For now we load the SDK in an 'async' way to preserve more breadcrumb data as performance is not so much of an issue. https://docs.sentry.io/platforms/javascript/install/lazy-load-sentry/#limitations
          data-lazy='no'
        ></script>
      )}
    </>
  );
}
