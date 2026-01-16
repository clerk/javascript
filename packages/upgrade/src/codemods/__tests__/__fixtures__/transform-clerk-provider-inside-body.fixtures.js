export const fixtures = [
  {
    name: 'Moves ClerkProvider from wrapping html to inside body',
    source: `
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
      `,
    output: `
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <html>
      <body><ClerkProvider>{children}</ClerkProvider></body>
    </html>
  );
}
      `,
  },
  {
    name: 'Preserves ClerkProvider props when moving',
    source: `
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider dynamic afterSignInUrl="/dashboard">
      <html lang="en">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
      `,
    output: `
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased"><ClerkProvider dynamic afterSignInUrl="/dashboard">{children}</ClerkProvider></body>
    </html>
  );
}
      `,
  },
  {
    name: 'Does not transform if ClerkProvider is already inside body',
    source: `
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
        `,
    output: '',
  },
  {
    name: 'Does not transform if ClerkProvider does not wrap html',
    source: `
import { ClerkProvider } from '@clerk/nextjs'

export default function Page() {
  return (
    <ClerkProvider>
      <div>{children}</div>
    </ClerkProvider>
  );
}
        `,
    output: '',
  },
  {
    name: 'Does not transform if not from @clerk/nextjs',
    source: `
import { ClerkProvider } from 'some-other-package'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
        `,
    output: '',
  },
  {
    name: 'Handles body with multiple children',
    source: `
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>
          <Header />
          <main>{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
      `,
    output: `
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <html>
      <body><ClerkProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ClerkProvider></body>
    </html>
  );
}
      `,
  },
  {
    name: 'Handles html with head element',
    source: `
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <head>
          <title>My App</title>
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
      `,
    output: `
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <title>My App</title>
      </head>
      <body><ClerkProvider>{children}</ClerkProvider></body>
    </html>
  );
}
      `,
  },
  {
    name: 'Handles import alias (ClerkProvider as CP)',
    source: `
import { ClerkProvider as CP } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <CP dynamic>
      <html>
        <body>{children}</body>
      </html>
    </CP>
  );
}
      `,
    output: `
import { ClerkProvider as CP } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <html>
      <body><CP dynamic>{children}</CP></body>
    </html>
  );
}
      `,
  },
  {
    name: 'Does not transform unrelated component when ClerkProvider is aliased but not used to wrap html',
    source: `
import { ClerkProvider as CP } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CP>{children}</CP>
      </body>
    </html>
  );
}
      `,
    output: '',
  },
  {
    name: 'Does not transform when only other specifiers are imported (no ClerkProvider)',
    source: `
import { SignIn, SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div>
      <SignIn />
    </div>
  );
}
      `,
    output: '',
  },
  {
    name: 'Handles multiple ClerkProviders - only transforms those wrapping html',
    source: `
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>
          <ClerkProvider afterSignInUrl="/inner">
            <div>{children}</div>
          </ClerkProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
      `,
    output: `
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <html>
      <body><ClerkProvider>
          <ClerkProvider afterSignInUrl="/inner">
            <div>{children}</div>
          </ClerkProvider>
        </ClerkProvider></body>
    </html>
  );
}
      `,
  },
];
