---
"@clerk/vue": minor
---

Add support for `<OrganizationProfile>` custom pages and links through `<OrganizationSwitcher>`

Example:

```vue
<script setup lang="ts">
import { OrganizationSwitcher } from '@clerk/vue'
import Icon from './Icon.vue'
</script>

<template>
  <header>
    <OrganizationSwitcher>
      <OrganizationSwitcher.OrganizationProfilePage label="Custom Page" url="custom">
        <template #labelIcon>
          <Icon />
        </template>
        <div>
          <h1>Custom Organization Profile Page</h1>
          <p>This is the custom organization profile page</p>
        </div>
      </OrganizationSwitcher.OrganizationProfilePage>
      <OrganizationSwitcher.OrganizationProfileLink label="Homepage" url="/">
        <template #labelIcon>
          <Icon />
        </template>
      </OrganizationSwitcher.OrganizationProfileLink>
    </OrganizationSwitcher>
  </header>
</template>
```
