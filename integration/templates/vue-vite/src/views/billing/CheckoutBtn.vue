<template>
  <main>
    <SignedIn>
      <CheckoutButton
        planId="cplan_2wMjqdlza0hTJc4HLCoBwAiExhF"
        planPeriod="month"
      >
        Checkout Now
      </CheckoutButton>
    </SignedIn>
  </main>
</template>

<script setup lang="ts">
import { SignedIn, CheckoutButton } from '@clerk/vue';
</script>
