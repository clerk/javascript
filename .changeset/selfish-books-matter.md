---
'@clerk/nextjs': patch
---

Use dynamic imports in `<ClerkProvider />` which you import from `@clerk/nextjs`.

Users on Next.js 12 and older can run into errors like these:

```shell
error - ./node_modules/@clerk/nextjs/dist/esm/app-router/client/ClerkProvider.js:10:22
Module not found: Can't resolve 'next/navigation'
```

The aforementioned `<ClerkProvider />` component contains code for both Next.js 12 (+ older) and Next.js 13 (+ newer). On older versions it can't find the imports only available in newer versions.

If you're seeing these errors, you have to do two things:

1. Update `@clerk/nextjs` to this version
1. Update your `next.config.js` to ignore these imports:

    ```js
    const webpack = require('webpack');

    /** @type {import('next').NextConfig} */
    const nextConfig = {
      reactStrictMode: true,
      webpack(config) {
        config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^next\/(navigation|headers|compat\/router)$/ }))
        return config;
      }
    }

    module.exports = nextConfig
    ```

    It is safe to ignore these modules as your Next.js 12 app won't hit these code paths.
