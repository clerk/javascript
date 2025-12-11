export const fixtures = [
  {
    name: 'Transforms Protect import',
    source: `
import { Protect } from "@clerk/react"
        `,
    output: `
import { Show } from "@clerk/react"
`,
  },
  {
    name: 'Transforms SignedIn and SignedOut imports',
    source: `
import { SignedIn, SignedOut } from "@clerk/react"
        `,
    output: `
import { Show } from "@clerk/react";
`,
  },
  {
    name: 'Transforms Protect in TSX',
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
    name: 'Transforms SignedIn usage',
    source: `
import { SignedIn } from "@clerk/react"

const App = () => (
  <SignedIn>
    <div>Child</div>
  </SignedIn>
)
        `,
    output: `
import { Show } from "@clerk/react"

const App = () => (
  <Show when="signedIn">
    <div>Child</div>
  </Show>
)
`,
  },
  {
    name: 'Transforms SignedOut usage',
    source: `
import { SignedOut } from "@clerk/react"

const App = () => (
  <SignedOut>
    <div>Child</div>
  </SignedOut>
)
        `,
    output: `
import { Show } from "@clerk/react"

const App = () => (
  <Show when="signedOut">
    <div>Child</div>
  </Show>
)
`,
  },
  {
    name: 'Transforms SignedIn namespace import',
    source: `
import * as Clerk from "@clerk/react"

const App = () => (
  <Clerk.SignedIn>
    <div>Child</div>
  </Clerk.SignedIn>
)
        `,
    output: `
import * as Clerk from "@clerk/react"

const App = () => (
  <Clerk.Show when="signedIn">
    <div>Child</div>
  </Clerk.Show>
)
`,
  },
  {
    name: 'Transforms Protect condition callback',
    source: `
import { Protect } from "@clerk/react"

function App() {
  return (
    <Protect condition={(has) => has({ role: "admin" })}>
      <Content />
    </Protect>
  )
}
        `,
    output: `
import { Show } from "@clerk/react"

function App() {
  return (
    <Show when={(has) => has({ role: "admin" })}>
      <Content />
    </Show>
  );
}
`,
  },
  {
    name: 'Transforms SignedIn import with other specifiers',
    source: `
import { ClerkProvider, SignedIn } from "@clerk/nextjs"
        `,
    output: `
import { ClerkProvider, Show } from "@clerk/nextjs"
`,
  },
  {
    name: 'Transforms ProtectProps type',
    source: `
import { ProtectProps } from "@clerk/react";
type Props = ProtectProps;
        `,
    output: `
import { ShowProps } from "@clerk/react";
type Props = ShowProps;
`,
  },
  {
    name: 'Self-closing Protect defaults to signedIn',
    source: `
import { Protect } from "@clerk/react"

const Thing = () => <Protect />
        `,
    output: `
import { Show } from "@clerk/react"

const Thing = () => <Show when="signedIn" />
`,
  },
  {
    name: 'Transforms Protect from hybrid package without client directive',
    source: `
import { Protect } from "@clerk/nextjs"

const App = () => (
  <Protect role="admin">
    <div>Child</div>
  </Protect>
)
        `,
    output: `
import { Show } from "@clerk/nextjs"

const App = () => (
  <Show when={{
    role: "admin"
  }}>
    <div>Child</div>
  </Show>
)
`,
  },
  {
    name: 'Transforms SignedOut to Show with fallback prop',
    source: `
import { SignedOut } from "@clerk/react"

const App = () => (
  <SignedOut fallback={<Other />}>
    <div>Child</div>
  </SignedOut>
)
        `,
    output: `
import { Show } from "@clerk/react"

const App = () => (
  <Show when="signedOut" fallback={<Other />}>
    <div>Child</div>
  </Show>
)
`,
  },
  {
    name: 'Transforms SignedOut namespace import with fallback',
    source: `
import * as Clerk from "@clerk/react"

const App = () => (
  <Clerk.SignedOut fallback={<Other />}>
    <div>Child</div>
  </Clerk.SignedOut>
)
        `,
    output: `
import * as Clerk from "@clerk/react"

const App = () => (
  <Clerk.Show when="signedOut" fallback={<Other />}>
    <div>Child</div>
  </Clerk.Show>
)
`,
  },
  {
    name: 'Aliased Protect import is transformed',
    source: `
import { Protect as CanAccess } from "@clerk/react"

function App() {
  return (
    <CanAccess permission="org:billing:manage">
      <BillingSettings />
    </CanAccess>
  )
}
        `,
    output: `
import { Show as CanAccess } from "@clerk/react"

function App() {
  return (
    <CanAccess when={{
      permission: "org:billing:manage"
    }}>
      <BillingSettings />
    </CanAccess>
  );
}
`,
  },
  {
    name: 'ProtectProps type aliases update',
    source: `
import { ProtectProps } from "@clerk/react";
type Props = ProtectProps;
type Another = ProtectProps;
        `,
    output: `
import { ShowProps } from "@clerk/react";
type Props = ShowProps;
type Another = ShowProps;
`,
  },
  {
    name: 'Protect with fallback prop',
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
    name: 'Protect with spread props',
    source: `
import { Protect } from "@clerk/react"

const props = { permission: "org:read" }
const App = () => <Protect {...props} />
        `,
    output: `
import { Show } from "@clerk/react"

const props = { permission: "org:read" }
const App = () => <Show when="signedIn" {...props} />
`,
  },
];
