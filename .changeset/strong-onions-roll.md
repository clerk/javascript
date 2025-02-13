---
"@clerk/nuxt": patch
"@clerk/vue": patch
---

Re-export error handling utilities from `@clerk/shared`

Example:

```vue
<script setup lang="ts">
import { useSignIn } from '@clerk/vue'
import { isClerkAPIResponseError } from '@clerk/vue/errors'

// ... form state refs and other setup ...
const { signIn } = useSignIn()

const handleSubmit = async () => {
  try {
    const signInAttempt = await signIn.value.create({
      identifier: email.value,
      password: password.value,
    })
    // ... handle successful sign in ...
  } catch (err) {
    // Type guard to safely handle Clerk API errors
    if (isClerkAPIResponseError(err)) {
      errors.value = err.errors // err.errors is properly typed as ClerkAPIError[]
    }
  }
}
</script>

<template>
  <!-- Form template here -->
</template>
```
