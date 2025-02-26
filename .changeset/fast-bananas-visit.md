---
"@clerk/nuxt": minor
"@clerk/vue": minor
---

Introduce `updateClerkOptions()` utility function to update Clerk options on the fly.

Usage:

```vue
<script setup>
import { updateClerkOptions } from '@clerk/vue'
import { dark } from '@clerk/themes'
import { frFR } from '@clerk/localizations'

function enableDarkTheme() {
  updateClerkOptions({
    appearance: {
      baseTheme: dark
    }
  })
}

function changeToFrench() {
  updateClerkOptions({
    localization: frFR
  })
}
</script>

<template>
  <div>
    <button @click="enableDarkTheme">Enable Dark Theme</button>
    <button @click="changeToFrench">Change to French</button>
  </div>
</template>
```
