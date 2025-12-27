<template>
  <main>
    <Show when="signed-in">
      <CheckoutButton
        planId="cplan_2wMjqdlza0hTJc4HLCoBwAiExhF"
        planPeriod="month"
      >
        Checkout Now
      </CheckoutButton>
    </Show>
  </main>
</template>

<script setup lang="ts">
import { Show } from '@clerk/vue';
import { CheckoutButton } from '@clerk/vue/experimental';
</script>
