<script setup>
import { useRoute, PricingTable } from '#imports';

const route = useRoute();
const { newSubscriptionRedirectUrl } = route.query;
</script>

<template>
  <PricingTable :newSubscriptionRedirectUrl="newSubscriptionRedirectUrl" />
</template>
