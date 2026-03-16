export const fixtures = [
  {
    name: 'JSX: renames clerkJSUrl to __internal_clerkJSUrl',
    source: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider clerkJSUrl="https://js.example.com/clerk.js">
      {children}
    </ClerkProvider>
  );
}
    `,
    output: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider __internal_clerkJSUrl="https://js.example.com/clerk.js">
      {children}
    </ClerkProvider>
  );
}
    `,
  },
  {
    name: 'JSX: renames clerkJSVersion to __internal_clerkJSVersion',
    source: `
import { ClerkProvider } from '@clerk/react';

export const App = () => (
  <ClerkProvider clerkJSVersion="5.0.0">
    <Main />
  </ClerkProvider>
);
    `,
    output: `
import { ClerkProvider } from '@clerk/react';

export const App = () => (
  <ClerkProvider __internal_clerkJSVersion="5.0.0">
    <Main />
  </ClerkProvider>
);
    `,
  },
  {
    name: 'JSX: renames clerkUIUrl and clerkUIVersion',
    source: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider clerkUIUrl="https://ui.example.com/ui.js" clerkUIVersion="1.0.0">
      {children}
    </ClerkProvider>
  );
}
    `,
    output: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider __internal_clerkUIUrl="https://ui.example.com/ui.js" __internal_clerkUIVersion="1.0.0">
      {children}
    </ClerkProvider>
  );
}
    `,
  },
  {
    name: 'JSX: renames all four props at once',
    source: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider
      clerkJSUrl="https://js.example.com/clerk.js"
      clerkJSVersion="5.0.0"
      clerkUIUrl="https://ui.example.com/ui.js"
      clerkUIVersion="1.0.0"
    >
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
      __internal_clerkJSUrl="https://js.example.com/clerk.js"
      __internal_clerkJSVersion="5.0.0"
      __internal_clerkUIUrl="https://ui.example.com/ui.js"
      __internal_clerkUIVersion="1.0.0"
    >
      {children}
    </ClerkProvider>
  );
}
    `,
  },
  {
    name: 'JSX: does not rename props on non-Clerk components',
    source: `
import { SomeProvider } from 'some-other-package';

export function App({ children }) {
  return (
    <SomeProvider clerkJSUrl="https://js.example.com/clerk.js">
      {children}
    </SomeProvider>
  );
}
    `,
    noChange: true,
  },
  {
    name: 'JSX: handles aliased import',
    source: `
import { ClerkProvider as CP } from '@clerk/react';

export function App({ children }) {
  return (
    <CP clerkJSUrl="https://js.example.com/clerk.js">
      {children}
    </CP>
  );
}
    `,
    output: `
import { ClerkProvider as CP } from '@clerk/react';

export function App({ children }) {
  return (
    <CP __internal_clerkJSUrl="https://js.example.com/clerk.js">
      {children}
    </CP>
  );
}
    `,
  },
  {
    name: 'JSX: skips if __internal_ prop already exists',
    source: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider clerkJSUrl="old" __internal_clerkJSUrl="new">
      {children}
    </ClerkProvider>
  );
}
    `,
    output: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider __internal_clerkJSUrl="new">
      {children}
    </ClerkProvider>
  );
}
    `,
  },
  {
    name: 'Object: renames properties in object literal',
    source: `
const options = {
  clerkJSUrl: 'https://js.example.com/clerk.js',
  clerkJSVersion: '5.0.0',
};
    `,
    output: `
const options = {
  __internal_clerkJSUrl: 'https://js.example.com/clerk.js',
  __internal_clerkJSVersion: '5.0.0',
};
    `,
  },
  {
    name: 'Object: renames all four properties',
    source: `
const options = {
  clerkJSUrl: 'https://js.example.com/clerk.js',
  clerkJSVersion: '5.0.0',
  clerkUIUrl: 'https://ui.example.com/ui.js',
  clerkUIVersion: '1.0.0',
};
    `,
    output: `
const options = {
  __internal_clerkJSUrl: 'https://js.example.com/clerk.js',
  __internal_clerkJSVersion: '5.0.0',
  __internal_clerkUIUrl: 'https://ui.example.com/ui.js',
  __internal_clerkUIVersion: '1.0.0',
};
    `,
  },
  {
    name: 'No matching props (no changes)',
    source: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider publishableKey="pk_test_123">
      {children}
    </ClerkProvider>
  );
}
    `,
    noChange: true,
  },
  {
    name: 'JSX: expression container value',
    source: `
import { ClerkProvider } from '@clerk/nextjs';

const jsUrl = 'https://js.example.com/clerk.js';

export function App({ children }) {
  return (
    <ClerkProvider clerkJSUrl={jsUrl}>
      {children}
    </ClerkProvider>
  );
}
    `,
    output: `
import { ClerkProvider } from '@clerk/nextjs';

const jsUrl = 'https://js.example.com/clerk.js';

export function App({ children }) {
  return (
    <ClerkProvider __internal_clerkJSUrl={jsUrl}>
      {children}
    </ClerkProvider>
  );
}
    `,
  },
];
