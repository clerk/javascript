import { defineComponent, type PropType, provide } from 'vue';

import { PortalInjectionKey } from '../keys';

/**
 * UNSAFE_PortalProvider allows you to specify a custom container for Clerk floating UI elements
 * (popovers, modals, tooltips, etc.) that use portals.
 *
 * Only components within this provider will be affected. Components outside the provider
 * will continue to use the default document.body for portals.
 *
 * This is particularly useful when using Clerk components inside external UI libraries
 * like Reka UI Dialog, where portaled elements need to render within the dialog's
 * container to remain interactable.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useTemplateRef } from 'vue';
 * import { DialogContent } from 'reka-ui';
 * import { UNSAFE_PortalProvider, UserButton } from '@clerk/vue';
 *
 * const dialogContentRef = useTemplateRef('dialogContentRef');
 * </script>
 *
 * <template>
 *   <DialogContent ref="dialogContentRef">
 *     <UNSAFE_PortalProvider :getContainer="() => dialogContentRef?.$el">
 *       <UserButton />
 *     </UNSAFE_PortalProvider>
 *   </DialogContent>
 * </template>
 * ```
 */
export const UNSAFE_PortalProvider = defineComponent({
  name: 'UNSAFE_PortalProvider',
  props: {
    /**
     * Function that returns the container element where portals should be rendered.
     * This allows Clerk components to render inside external dialogs/popovers
     * (e.g., Reka UI Dialog) instead of document.body.
     */
    getContainer: {
      type: Function as PropType<() => HTMLElement | null>,
      required: true,
    },
  },
  setup(props, { slots }) {
    provide(PortalInjectionKey, { getContainer: props.getContainer });
    return () => slots.default?.();
  },
});
