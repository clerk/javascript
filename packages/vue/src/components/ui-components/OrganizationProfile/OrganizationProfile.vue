<script setup lang="ts">
import { computed, provide } from 'vue';
import { useOrganizationProfileCustomPages } from '../../../utils/useCustomPages';
import { useClerk } from '../../../composables';
import type { OrganizationProfileProps } from '@clerk/shared/types';
import { OrganizationProfileInjectionKey } from '../../../keys';
import { ClerkHostRenderer, CustomPortalsRenderer } from '../../ClerkHostRenderer';

type Props = Omit<OrganizationProfileProps, 'customPages'>;
const props = defineProps<Props>();

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
    :update-props="(clerk as any)?.__internal_updateProps"
  />
  <CustomPortalsRenderer :custom-pages-portals="customPagesPortals" />
  <slot />
</template>
