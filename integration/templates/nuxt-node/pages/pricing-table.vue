<script setup lang="ts">
import { Experimental_PricingTable } from '@clerk/nuxt/components';
const { data: user } = await useFetch('/api/me');
</script>

<template>
  <Experimental_PricingTable />
</template>
