export const fixtures = [
  {
    name: 'Basic import transform',
    source: `
import { Protect } from "@clerk/react"
        `,
    output: `
import { Show } from "@clerk/react"
`,
  },
  {
    name: 'Import transform with other imports',
    source: `
import { ClerkProvider, Protect, SignedIn } from "@clerk/react"
        `,
    output: `
import { ClerkProvider, Show, SignedIn } from "@clerk/react"
`,
  },
  {
    name: 'Import from @clerk/nextjs without use client - should NOT transform (RSC)',
    source: `
import { Protect } from "@clerk/nextjs"
        `,
    output: null,
  },
  {
    name: 'Import transform for @clerk/chrome-extension',
    source: `
import { Protect } from "@clerk/chrome-extension"
        `,
    output: `
import { Show } from "@clerk/chrome-extension"
`,
  },
  {
    name: 'Basic permission prop transform',
    source: `
import { Protect } from "@clerk/react"

function App() {
  return (
    <Protect permission="org:billing:manage">
      <BillingSettings />
    </Protect>
  )
}
        `,
    output: `
import { Show } from "@clerk/react"

function App() {
  return (
    <Show when={{
      permission: "org:billing:manage"
    }}>
      <BillingSettings />
    </Show>
  );
}
`,
  },
  {
    name: 'Basic role prop transform',
    source: `
import { Protect } from "@clerk/react"

function App() {
  return (
    <Protect role="admin">
      <AdminPanel />
    </Protect>
  )
}
        `,
    output: `
import { Show } from "@clerk/react"

function App() {
  return (
    <Show when={{
      role: "admin"
    }}>
      <AdminPanel />
    </Show>
  );
}
`,
  },
  {
    name: 'Boolean shorthand auth prop transforms to true',
    source: `
import { Protect } from "@clerk/react"

function App() {
  return (
    <Protect role>
      <Content />
    </Protect>
  )
}
        `,
    output: `
import { Show } from "@clerk/react"

function App() {
  return (
    <Show when={{
      role: true
    }}>
      <Content />
    </Show>
  );
}
`,
  },
  {
    name: 'Feature prop transform',
    source: `
import { Protect } from "@clerk/react"

function App() {
  return (
    <Protect feature="user:premium">
      <PremiumContent />
    </Protect>
  )
}
        `,
    output: `
import { Show } from "@clerk/react"

function App() {
  return (
    <Show when={{
      feature: "user:premium"
    }}>
      <PremiumContent />
    </Show>
  );
}
`,
  },
  {
    name: 'Plan prop transform',
    source: `
import { Protect } from "@clerk/react"

function App() {
  return (
    <Protect plan="pro">
      <ProFeatures />
    </Protect>
  )
}
        `,
    output: `
import { Show } from "@clerk/react"

function App() {
  return (
    <Show when={{
      plan: "pro"
    }}>
      <ProFeatures />
    </Show>
  );
}
`,
  },
  {
    name: 'Condition prop transform',
    source: `
import { Protect } from "@clerk/react"

function App() {
  return (
    <Protect condition={(has) => has({ permission: "org:read" })}>
      <Content />
    </Protect>
  )
}
        `,
    output: `
import { Show } from "@clerk/react"

function App() {
  return (
    <Show when={(has) => has({ permission: "org:read" })}>
      <Content />
    </Show>
  );
}
`,
  },
  {
    name: 'With fallback prop',
    source: `
import { Protect } from "@clerk/react"

function App() {
  return (
    <Protect permission="org:billing:manage" fallback={<Unauthorized />}>
      <BillingSettings />
    </Protect>
  )
}
        `,
    output: `
import { Show } from "@clerk/react"

function App() {
  return (
    <Show when={{
      permission: "org:billing:manage"
    }} fallback={<Unauthorized />}>
      <BillingSettings />
    </Show>
  );
}
`,
  },
  {
    name: 'Self-closing Protect',
    source: `
import { Protect } from "@clerk/react"

function App() {
  return <Protect role="admin" />
}
        `,
    output: `
import { Show } from "@clerk/react"

function App() {
  return (
    <Show when={{
      role: "admin"
    }} />
  );
}
`,
  },
  {
    name: 'Handles directives',
    source: `"use client";

import { Protect } from "@clerk/nextjs";

export function Protected() {
  return (
    <Protect permission="org:read">
      <Content />
    </Protect>
  );
}
`,
    output: `"use client";

import { Show } from "@clerk/nextjs";

export function Protected() {
  return (
    <Show when={{
      permission: "org:read"
    }}>
      <Content />
    </Show>
  );
}`,
  },
  {
    name: 'Dynamic permission value',
    source: `
import { Protect } from "@clerk/react"

function App({ requiredPermission }) {
  return (
    <Protect permission={requiredPermission}>
      <Content />
    </Protect>
  )
}
        `,
    output: `
import { Show } from "@clerk/react"

function App({ requiredPermission }) {
  return (
    <Show when={{
      permission: requiredPermission
    }}>
      <Content />
    </Show>
  );
}
`,
  },
  {
    name: 'RSC file (no use client) from @clerk/nextjs - should NOT transform',
    source: `import { Protect } from "@clerk/nextjs";

export default async function Page() {
  return (
    <Protect permission="org:read">
      <Content />
    </Protect>
  );
}
`,
    output: null,
  },
  {
    name: 'Client file (use client) from @clerk/nextjs - should transform',
    source: `"use client";

import { Protect } from "@clerk/nextjs";

export function ClientComponent() {
  return (
    <Protect permission="org:read">
      <Content />
    </Protect>
  );
}
`,
    output: `"use client";

import { Show } from "@clerk/nextjs";

export function ClientComponent() {
  return (
    <Show when={{
      permission: "org:read"
    }}>
      <Content />
    </Show>
  );
}`,
  },
  {
    name: 'Client-only package (@clerk/react) without use client - should still transform',
    source: `import { Protect } from "@clerk/react";

function Component() {
  return (
    <Protect role="admin">
      <AdminContent />
    </Protect>
  );
}
`,
    output: `import { Show } from "@clerk/react";

function Component() {
  return (
    <Show when={{
      role: "admin"
    }}>
      <AdminContent />
    </Show>
  );
}`,
  },
];
