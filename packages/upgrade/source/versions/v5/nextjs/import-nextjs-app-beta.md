---
title: '`@clerk/nextjs/app-beta` import removed'
category: 'deprecation-removal'
matcher: "@clerk\\/nextjs\\/app-beta"
---

If you are using the `@clerk/nextjs/app-beta` import anywhere, it should use `@clerk/nextjs` instead. The `app-beta` import has been removed as our approuter support is stable, if there are any places you’re using it you can remove.

Make this change carefully as some behavior may have changed between our beta and stable releases. You can refer to [our documentation](https://clerk.com/docs/quickstarts/nextjs) and/or [approuter example](https://github.com/clerk/clerk-nextjs-app-quickstart) for up-to-date usage.

The `@clerk/nextjs` import will work with both App Router and Pages Router.
