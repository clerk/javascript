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
import { SignedIn } from '@clerk/vue';
import { CheckoutButton } from '@clerk/vue/experimental';
</script>
