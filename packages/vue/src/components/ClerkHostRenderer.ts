import type { PropType } from 'vue';
import { computed, defineComponent, h, onScopeDispose, ref, watchEffect } from 'vue';

import type { CustomPortalsRendererProps } from '../types';
import { ClerkLoaded } from './controlComponents';

type AnyObject = Record<string, any>;

export const CustomPortalsRenderer = defineComponent((props: CustomPortalsRendererProps) => {
  return () => [...(props?.customPagesPortals ?? []), ...(props?.customMenuItemsPortals ?? [])];
});

/**
 * A utility component that handles mounting and unmounting of Clerk UI components.
 * The component only mounts when Clerk is fully loaded and automatically
 * handles cleanup on unmount.
 */
export const ClerkHostRenderer = defineComponent({
  props: {
    mount: {
      type: Function as PropType<(node: HTMLDivElement, props: AnyObject) => void>,
      required: false,
    },
    unmount: {
      type: Function as PropType<(node: HTMLDivElement) => void>,
      required: false,
    },
    updateProps: {
      type: Function as PropType<(props: { node: HTMLDivElement; props: AnyObject | undefined }) => void>,
      required: false,
    },
    props: {
      type: Object,
      required: false,
    },
  },
  setup(props) {
    const portalRef = ref<HTMLDivElement | null>(null);
    const isPortalMounted = ref(false);
    // Make the props reactive so the watcher can react to changes
    const componentProps = computed(() => ({ ...props.props }));

    watchEffect(() => {
      if (!portalRef.value) {
        return;
      }

      if (isPortalMounted.value) {
        props.updateProps?.({ node: portalRef.value, props: componentProps.value });
      } else {
        props.mount?.(portalRef.value, componentProps.value);
        isPortalMounted.value = true;
      }
    });

    onScopeDispose(() => {
      if (isPortalMounted.value && portalRef.value) {
        props.unmount?.(portalRef.value);
      }
    });

    return () => h(ClerkLoaded, () => h('div', { ref: portalRef }));
  },
});
