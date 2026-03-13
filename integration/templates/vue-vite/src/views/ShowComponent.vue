<script setup lang="ts">
import { Show } from '@clerk/vue';
</script>

<template>
  <div id="show-tests">
    <div data-show-signed-in>
      <Show when="signed-in">
        <p>show-signed-in-content</p>
      </Show>
    </div>
    <div data-show-signed-out>
      <Show when="signed-out">
        <p>show-signed-out-content</p>
      </Show>
    </div>
    <div data-show-role>
      <Show :when="{ role: 'org:admin' }">
        <p>show-admin-content</p>
        <template #fallback>
          <p>show-admin-fallback</p>
        </template>
      </Show>
    </div>
    <div data-show-permission>
      <Show :when="{ permission: 'org:sys_memberships:manage' }">
        <p>show-permission-content</p>
        <template #fallback>
          <p>show-permission-fallback</p>
        </template>
      </Show>
    </div>
  </div>
</template>
