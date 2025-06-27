<script setup>
const route = useRoute();
const { newSubscriptionRedirectUrl } = route.query;
</script>

<template>
  <Protect plan="free_user">
    <p>user in free</p>
  </Protect>
  <Protect plan="pro">
    <p>user in pro</p>
  </Protect>
  <Protect plan="plus">
    <p>user in plus</p>
  </Protect>
  <PricingTable :newSubscriptionRedirectUrl="newSubscriptionRedirectUrl" />
</template>
