<script setup lang="ts">
import { OrganizationSwitcher, Show } from '@clerk/vue';
</script>

<template>
  <Show when="signedIn">
    <OrganizationSwitcher />
  </Show>
  <div>
    <ul>
      <Show when="signedIn">
        <li>
          <RouterLink to="/profile">Profile</RouterLink>
        </li>
      </Show>
    </ul>
  </div>
</template>
