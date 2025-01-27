import type { PropType } from 'vue';
import { computed, defineComponent, h, onScopeDispose, ref, watchEffect } from 'vue';

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
        if (props.mount) {
          props.mount(portalRef.value, componentProps.value);
        }
        if (props.open) {
          props.open(componentProps.value);
        }
        isPortalMounted.value = true;
      }
    });

    onScopeDispose(() => {
      if (isPortalMounted.value && portalRef.value) {
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
