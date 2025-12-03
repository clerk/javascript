<script setup lang="ts">
import { useClerk } from '../../../composables';
import type { OrganizationSwitcherProps, OrganizationProfileProps } from '@clerk/shared/types';
import { ClerkHostRenderer, CustomPortalsRenderer } from '../../ClerkHostRenderer';
import { useOrganizationProfileCustomPages } from '../../../utils/useCustomPages';
import { computed, provide } from 'vue';
import { OrganizationProfileInjectionKey } from '../../../keys';

const clerk = useClerk();

type Props = Omit<OrganizationSwitcherProps, 'organizationProfileProps' | '__experimental_asStandalone'> & {
  organizationProfileProps?: Pick<OrganizationProfileProps, 'appearance'>;
};
const props = defineProps<Props>();

const { customPages, customPagesPortals, addCustomPage } = useOrganizationProfileCustomPages();

const finalProps = computed<Props>(() => ({
  ...props,
  organizationProfileProps: {
    ...(props.organizationProfileProps || {}),
    customPages: customPages.value,
  },
}));

provide(OrganizationProfileInjectionKey, {
  addCustomPage,
});
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountOrganizationSwitcher"
    :unmount="clerk?.unmountOrganizationSwitcher"
    :update-props="(clerk as any)?.__internal_updateProps"
    :props="finalProps"
  />
  <CustomPortalsRenderer :custom-pages-portals="customPagesPortals" />
  <slot />
</template>
