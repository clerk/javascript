export const fixtures = [
  {
    name: 'JSX: isSatellite={true}',
    source: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider isSatellite={true} domain="example.com">
      {children}
    </ClerkProvider>
  );
}
    `,
    output: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider isSatellite={true} domain="example.com" satelliteAutoSync={true}>
      {children}
    </ClerkProvider>
  );
}
    `,
  },
  {
    name: 'JSX: isSatellite (boolean shorthand)',
    source: `
import { ClerkProvider } from '@clerk/react';

export const App = () => (
  <ClerkProvider isSatellite domain="satellite.example.com">
    <Main />
  </ClerkProvider>
);
    `,
    output: `
import { ClerkProvider } from '@clerk/react';

export const App = () => (
  <ClerkProvider isSatellite domain="satellite.example.com" satelliteAutoSync={true}>
    <Main />
  </ClerkProvider>
);
    `,
  },
  {
    name: 'JSX: isSatellite with function value',
    source: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider isSatellite={(url) => url.host === 'satellite.example.com'} domain="example.com">
      {children}
    </ClerkProvider>
  );
}
    `,
    output: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider
      isSatellite={(url) => url.host === 'satellite.example.com'}
      domain="example.com"
      satelliteAutoSync={true}>
      {children}
    </ClerkProvider>
  );
}
    `,
  },
  {
    name: 'JSX: already has satelliteAutoSync',
    source: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider isSatellite={true} satelliteAutoSync={false} domain="example.com">
      {children}
    </ClerkProvider>
  );
}
    `,
    noChange: true,
  },
  {
    name: 'Object: isSatellite in clerkMiddleware options',
    source: `
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  isSatellite: true,
  domain: 'example.com',
});
    `,
    output: `
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  isSatellite: true,
  satelliteAutoSync: true,
  domain: 'example.com'
});
    `,
  },
  {
    name: 'Object: isSatellite in variable declaration',
    source: `
const options = {
  isSatellite: true,
  domain: 'satellite.example.com',
};
    `,
    output: `
const options = {
  isSatellite: true,
  satelliteAutoSync: true,
  domain: 'satellite.example.com'
};
    `,
  },
  {
    name: 'Object: isSatellite with function value',
    source: `
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  isSatellite: (url) => url.host === 'satellite.example.com',
  domain: 'example.com',
});
    `,
    output: `
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  isSatellite: (url) => url.host === 'satellite.example.com',
  satelliteAutoSync: true,
  domain: 'example.com'
});
    `,
  },
  {
    name: 'Object: already has satelliteAutoSync',
    source: `
const options = {
  isSatellite: true,
  satelliteAutoSync: false,
  domain: 'example.com',
};
    `,
    noChange: true,
  },
  {
    name: 'No isSatellite present (no changes)',
    source: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider domain="example.com">
      {children}
    </ClerkProvider>
  );
}
    `,
    noChange: true,
  },
];
