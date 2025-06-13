<script setup lang="ts">
import { PricingTable } from '@clerk/vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const newSubscriptionRedirectUrl = route.query.newSubscriptionRedirectUrl as string;
</script>

<template>
  <PricingTable :newSubscriptionRedirectUrl="newSubscriptionRedirectUrl" />
</template>
