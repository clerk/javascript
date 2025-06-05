<template>
  <PricingTable :newSubscriptionRedirectUrl="newSubscriptionRedirectUrl" />
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
const newSubscriptionRedirectUrl = route.query.newSubscriptionRedirectUrl;
</script>
