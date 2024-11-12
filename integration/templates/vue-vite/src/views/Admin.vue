<script setup lang="ts">
import { Protect } from '@clerk/vue';
</script>

<template>
  <Protect>
    <p>I am an admin</p>
    <template #fallback>
      <p>Not an admin</p>
    </template>
  </Protect>
</template>
