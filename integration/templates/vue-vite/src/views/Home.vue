<script setup lang="ts">
import { OrganizationSwitcher, Show } from '@clerk/vue';
</script>

<template>
  <Show when="signed-in">
    <OrganizationSwitcher />
  </Show>
  <div>
    <ul>
      <Show when="signed-in">
        <li>
          <RouterLink to="/profile">Profile</RouterLink>
        </li>
      </Show>
    </ul>
  </div>
</template>
