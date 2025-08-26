import type { PropType } from 'vue';
import { defineComponent, h, onUnmounted, ref, watch, watchEffect } from 'vue';

import type { CustomPortalsRendererProps } from '../types';
import { ClerkLoaded } from './controlComponents';

type AnyObject = Record<string, any>;

export const CustomPortalsRenderer = defineComponent((props: CustomPortalsRendererProps) => {
  return () => [...(props?.customPagesPortals ?? []), ...(props?.customMenuItemsPortals ?? [])];
});

/**
 * Used to orchestrate mounting of Clerk components in a host Vue application.
 * Components are rendered into a specific DOM node using mount/unmount methods provided by the Clerk class.
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
    open: {
      type: Function as PropType<(props: AnyObject) => void>,
      required: false,
    },
    close: {
      type: Function as PropType<() => void>,
      required: false,
    },
    updateProps: {
      type: Function as PropType<(props: { node: HTMLDivElement; props: AnyObject | undefined }) => void>,
      required: false,
    },
    props: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  setup(props) {
    const portalRef = ref<HTMLDivElement | null>(null);
    let isPortalMounted = false;

    watchEffect(() => {
      // Skip if portal element isn't ready or component is already mounted
      if (!portalRef.value || isPortalMounted) {
        return;
      }

      if (props.mount) {
        props.mount(portalRef.value, props.props);
      }
      if (props.open) {
        props.open(props.props);
      }
      isPortalMounted = true;
    });

    watch(
      () => props.props,
      newProps => {
        if (isPortalMounted && props.updateProps && portalRef.value) {
          props.updateProps({ node: portalRef.value, props: newProps });
        }
      },
      { deep: true },
    );

    onUnmounted(() => {
      if (isPortalMounted && portalRef.value) {
        if (props.unmount) {
          props.unmount(portalRef.value);
        }
        if (props.close) {
          props.close();
        }
      }
    });

    return () => h(ClerkLoaded, () => h('div', { ref: portalRef }));
  },
});
