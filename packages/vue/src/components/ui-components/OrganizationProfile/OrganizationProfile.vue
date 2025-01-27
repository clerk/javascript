<script setup lang="ts">
import { computed, provide } from 'vue';
import { useOrganizationProfileCustomPages } from '../../../utils/useCustomPages';
import { useClerk } from '../../../composables';
import { OrganizationProfileProps } from '@clerk/types';
import { OrganizationProfileInjectionKey } from '../../../keys';
import { ClerkHostRenderer, CustomPortalsRenderer } from '../../ClerkHostRenderer';

const props = defineProps<OrganizationProfileProps>();
const clerk = useClerk();
const { customPages, customPagesPortals, addCustomPage } = useOrganizationProfileCustomPages();

const finalProps = computed(() => ({
  ...props,
  customPages: customPages.value,
}));

provide(OrganizationProfileInjectionKey, {
  addCustomPage,
});
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountOrganizationProfile"
    :unmount="clerk?.unmountOrganizationProfile"
    :props="finalProps"
    :update-props="(clerk as any)?.__unstable__updateProps"
  />
  <CustomPortalsRenderer :custom-pages-portals="customPagesPortals" />
  <slot />
</template>
