<script setup lang="ts">
import { useClerk } from '../../../composables';
import type { UserButtonProps, UserProfileProps } from '@clerk/shared/types';
import { ClerkHostRenderer, CustomPortalsRenderer } from '../../ClerkHostRenderer';
import { computed, provide } from 'vue';
import { UserButtonInjectionKey, UserProfileInjectionKey } from '../../../keys';
import { useUserProfileCustomPages } from '../../../utils/useCustomPages';
import { useUserButtonCustomMenuItems } from '../../../utils/useCustomMenuItems';

type Props = Omit<UserButtonProps, 'userProfileProps' | 'customMenuItems'> & {
  userProfileProps?: Pick<UserProfileProps, 'additionalOAuthScopes' | 'appearance' | 'apiKeysProps'>;
};
const props = defineProps<Props>();

const clerk = useClerk();

const { customMenuItems, customMenuItemsPortals, addCustomMenuItem } = useUserButtonCustomMenuItems();
const { customPages, customPagesPortals, addCustomPage } = useUserProfileCustomPages();

const finalProps = computed<Props>(() => ({
  ...props,
  userProfileProps: {
    ...(props.userProfileProps || {}),
    customPages: customPages.value,
  },
  customMenuItems: customMenuItems.value,
}));

provide(UserButtonInjectionKey, {
  addCustomMenuItem,
});
provide(UserProfileInjectionKey, {
  addCustomPage,
});
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountUserButton"
    :unmount="clerk?.unmountUserButton"
    :props="finalProps"
    :update-props="(clerk as any)?.__unstable__updateProps"
  />
  <CustomPortalsRenderer
    :custom-pages-portals="customPagesPortals"
    :custom-menu-items-portals="customMenuItemsPortals"
  />
  <slot />
</template>
