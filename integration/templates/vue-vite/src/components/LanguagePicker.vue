<script setup lang="ts">
import { updateClerkOptions } from '@clerk/vue';

const onChange = async (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  let localization: Record<string, any> | undefined;

  if (value === 'fr') {
    localization = (await import('@clerk/localizations/fr-FR')).frFR;
  } else {
    localization = undefined;
  }

  updateClerkOptions({
    localization,
  });
};
</script>

<template>
  <select @change="onChange">
    <option value="en">English</option>
    <option value="fr">French</option>
  </select>
</template>
