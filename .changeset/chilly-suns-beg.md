---
'@clerk/astro': minor
---

Add support for type-safe environment variables using the [`astro:env` API](https://docs.astro.build/en/reference/configuration-reference/#env).

The integration now provides a type-safe schema for all Clerk environment variables by default. You can use the environment variables like so:

```js
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from "astro:env/client"
import { CLERK_SECRET_KEY } from "astro:env/server"
```

To override this behavior, you can disable the feature by setting `enableEnvSchema` to `false`:

```js
export default defineConfig({
  integrations: [clerk({ enableEnvSchema: false })],
})
```
