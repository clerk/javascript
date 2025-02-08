---
'@clerk/astro': minor
---

Add support for type-safe environment variables using the [`astro:env` API](https://docs.astro.build/en/reference/configuration-reference/#experimentalenv).

You can opt-in to add a type-safe schema for all your Clerk environment variables by enabling the `enableEnvSchema` option.

```js
export default defineConfig({
  integrations: [clerk({ enableEnvSchema: true })],
})
```

Afterwards you can use the environment variables like so:

```js
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from "astro:env/client"
import { CLERK_SECRET_KEY } from "astro:env/server"
```
