---
'@clerk/vue': patch
---

Adds ability to render custom `<UserProfile>` links inside `<UserButton>` component.

Example:

```vue
<script setup>
import { UserButton } from '@clerk/vue'
</script>

<template>
  <UserButton>
    <UserButton.UserProfileLink
      label="Homepage"
      url="/"
    >
      <template #labelIcon>
        <div>Icon</div>
      </template>
    </UserButton.UserProfileLink>
  </UserButton>
</template>
```
