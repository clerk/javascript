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
    name: 'Transforms Protect import from legacy package',
    source: `
import { Protect } from "@clerk/clerk-react"
        `,
    output: `
import { Show } from "@clerk/clerk-react"
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
  <Show when="signed-in">
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
  <Show when="signed-out">
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
  <Clerk.Show when="signed-in">
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

const Thing = () => <Show when="signed-in" />
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
  <Show when="signed-out" fallback={<Other />}>
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
  <Clerk.Show when="signed-out" fallback={<Other />}>
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
const App = () => <Show when="signed-in" {...props} />
`,
  },
  {
    name: 'Transforms Protect require destructuring',
    source: `
const { Protect } = require("@clerk/react");

function App() {
  return <Protect role="admin">ok</Protect>;
}
        `,
    output: `
const { Show } = require("@clerk/react");

function App() {
  return (
    <Show when={{
      role: "admin"
    }}>ok</Show>
  );
}
`,
  },
  {
    name: 'Transforms SignedIn and SignedOut require destructuring',
    source: `
const { SignedIn, SignedOut } = require("@clerk/react");

const App = () => (
  <>
    <SignedIn>in</SignedIn>
    <SignedOut>out</SignedOut>
  </>
);
        `,
    output: `
const {
  Show
} = require("@clerk/react");

const App = () => (
  <>
    <Show when="signed-in">in</Show>
    <Show when="signed-out">out</Show>
  </>
);
`,
  },
  {
    name: 'Transforms namespace require',
    source: `
const Clerk = require("@clerk/react");

const App = () => (
  <Clerk.Protect role="admin">
    ok
  </Clerk.Protect>
);
        `,
    output: `
const Clerk = require("@clerk/react");

const App = () => (
  <Clerk.Show when={{
    role: "admin"
  }}>
    ok
  </Clerk.Show>
);
`,
  },
  {
    name: 'Transforms Protect from other @clerk packages',
    source: `
import { Protect as ProtectExpo } from "@clerk/expo";
import { Protect as ProtectVue } from "@clerk/vue";
import { Protect as ProtectChrome } from "@clerk/chrome-extension";
        `,
    output: `
import { Show as ProtectExpo } from "@clerk/expo";
import { Show as ProtectVue } from "@clerk/vue";
import { Show as ProtectChrome } from "@clerk/chrome-extension";
`,
  },
  {
    name: 'Transforms default import member usage',
    source: `
import Clerk from "@clerk/react";

const App = () => (
  <Clerk.Protect role="admin">
    ok
  </Clerk.Protect>
);
        `,
    output: `
import Clerk from "@clerk/react";

const App = () => (
  <Clerk.Show when={{
    role: "admin"
  }}>
    ok
  </Clerk.Show>
);
`,
  },
  {
    name: 'Transforms Protect namespace import member usage',
    source: `
import * as Clerk from "@clerk/react";

const App = () => (
  <Clerk.Protect role="admin">
    ok
  </Clerk.Protect>
);
        `,
    output: `
import * as Clerk from "@clerk/react";

const App = () => (
  <Clerk.Show when={{
    role: "admin"
  }}>
    ok
  </Clerk.Show>
);
`,
  },
  {
    name: 'Self-closing SignedIn and SignedOut are transformed',
    source: `
import { SignedIn, SignedOut } from "@clerk/react";

const App = () => (
  <>
    <SignedIn />
    <SignedOut />
  </>
);
        `,
    output: `
import { Show } from "@clerk/react";

const App = () => (
  <>
    <Show when="signed-in" />
    <Show when="signed-out" />
  </>
);
`,
  },
  {
    name: 'Transforms SignedIn alias import usage',
    source: `
import { SignedIn as OnlyWhenSignedIn } from "@clerk/react";

const App = () => (
  <OnlyWhenSignedIn>
    ok
  </OnlyWhenSignedIn>
);
        `,
    output: `
import { Show as OnlyWhenSignedIn } from "@clerk/react";

const App = () => (
  <OnlyWhenSignedIn when="signed-in">
    ok
  </OnlyWhenSignedIn>
);
`,
  },
  {
    name: 'Transforms Protect require destructuring with alias',
    source: `
const { Protect: CanAccess } = require("@clerk/react");

const App = () => (
  <CanAccess role="admin">
    ok
  </CanAccess>
);
        `,
    output: `
const { Show: CanAccess } = require("@clerk/react");

const App = () => (
  <CanAccess when={{
    role: "admin"
  }}>
    ok
  </CanAccess>
);
`,
  },
  {
    name: 'Transforms import with duplicate Show specifier',
    source: `
import { Protect, Show } from "@clerk/react";

const App = () => <Protect role="admin" />;
        `,
    output: `
import { Show } from "@clerk/react";

const App = () => <Show when={{
  role: "admin"
}} />;
`,
  },
  {
    name: 'Transforms import type ProtectProps',
    source: `
import type { ProtectProps } from "@clerk/react";
type Props = ProtectProps;
        `,
    output: `
import type { ShowProps } from "@clerk/react";
type Props = ShowProps;
`,
  },
  {
    name: 'Sorts when object keys for determinism',
    source: `
import { Protect } from "@clerk/react";

const App = () => (
  <Protect role="admin" permission="org:billing:manage" treatPendingAsSignedOut>
    ok
  </Protect>
);
        `,
    output: `
import { Show } from "@clerk/react";

const App = () => (
  <Show
    when={{
      permission: "org:billing:manage",
      role: "admin"
    }}
    treatPendingAsSignedOut>
    ok
  </Show>
);
`,
  },
  {
    name: 'Does not transform non-clerk Protect',
    source: `
import { Protect } from "./local";

const App = () => (
  <Protect role="admin">
    ok
  </Protect>
);
        `,
    output: null,
  },
  {
    name: 'Transforms self-closing namespaced Protect component',
    source: `
import * as Clerk from "@clerk/react";

const App = () => <Clerk.Protect permission="org:read" />;
        `,
    output: `
import * as Clerk from "@clerk/react";

const App = () => <Clerk.Show when={{
  permission: "org:read"
}} />;
`,
  },
  {
    name: 'Transforms namespaced SignedIn and SignedOut in same file',
    source: `
import * as Clerk from "@clerk/nextjs";

const App = () => (
  <>
    <Clerk.SignedIn>
      <Dashboard />
    </Clerk.SignedIn>
    <Clerk.SignedOut>
      <Login />
    </Clerk.SignedOut>
    <Clerk.Protect role="admin">
      <AdminPanel />
    </Clerk.Protect>
  </>
);
        `,
    output: `
import * as Clerk from "@clerk/nextjs";

const App = () => (
  <>
    <Clerk.Show when="signed-in">
      <Dashboard />
    </Clerk.Show>
    <Clerk.Show when="signed-out">
      <Login />
    </Clerk.Show>
    <Clerk.Show when={{
      role: "admin"
    }}>
      <AdminPanel />
    </Clerk.Show>
  </>
);
`,
  },
];
