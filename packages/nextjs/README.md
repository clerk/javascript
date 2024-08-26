<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_nextjs" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/nextjs</h1>
</p>

<p align="center">
  <a href="https://clerk.com/discord">
    <img src="https://img.shields.io/discord/856971667393609759.svg?logo=discord" alt="Chat on Discord" />
  </a>
  <a href="https://clerk.com/docs?utm_source=github&utm_medium=clerk_nextjs">
    <img src="https://img.shields.io/badge/documentation-clerk-green.svg" alt="Clerk documentation" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=ClerkDev">
    <img src="https://img.shields.io/twitter/follow/ClerkDev?style=social" alt="Follow on Twitter" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/clerk/javascript/blob/main/packages/nextjs/CHANGELOG.md">
    Changelog
  </a>
  ·
  <a href="https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml">
    Report a Bug
  </a>
  ·
  <a href="https://feedback.clerk.com/roadmap">
    Request a Feature
  </a>
  ·
  <a href="https://clerk.com/contact">
    Get help
  </a>
</p>

---

## Getting Started

[Clerk](https://clerk.com/?utm_source=github&utm_medium=clerk_nextjs) is the easiest way to add authentication and user management to your Next.js application. Add sign up, sign in, and profile management to your application in minutes.

### Prerequisites

- Next.js 13.0.4 or later
- React 18 or later
- Node.js `>=18.17.0` or later
- An existing Clerk application. [Create your account for free](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=clerk_nextjs).

### Installation

The fastest way to get started with Clerk is by following the [Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs?utm_source=github&utm_medium=clerk_nextjs).

Alternatively, you can follow these steps to add minimal Clerk support to your app:

1. Install `@clerk/nextjs`

   ```shell
   npm install @clerk/nextjs
   ```

1. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to your `.env.local` file. This key can always be retrieved from the [API keys](https://dashboard.clerk.com/last-active?path=api-keys) page of your Clerk dashboard.

1. Add [`<ClerkProvider>`](https://clerk.com/docs/components/clerk-provider?utm_source=github&utm_medium=clerk_nextjs) and Clerk's [prebuilt components](https://clerk.com/docs/components/overview?utm_source=github&utm_medium=clerk_nextjs) to your application, for example inside your header (of your Next.js App Router application) of `app/layout.tsx`:

   ```tsx
   import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

   export default function RootLayout({ children }) {
     return (
       <ClerkProvider>
         <html lang='en'>
           <body>
             <header>
               <SignedOut>
                 <SignInButton />
               </SignedOut>
               <SignedIn>
                 <UserButton />
               </SignedIn>
             </header>
             <main>{children}</main>
           </body>
         </html>
       </ClerkProvider>
     );
   }
   ```

## Usage

For further information, guides, and examples visit the [Next.js reference documentation](https://clerk.com/docs/references/nextjs/overview?utm_source=github&utm_medium=clerk_nextjs).

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_nextjs)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/nextjs` follows good practices of security, but 100% security cannot be assured.

`@clerk/nextjs` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/nextjs/LICENSE) for more information.
