import type { Slot } from 'vue';
import { computed, h, ref, Teleport } from 'vue';

interface RawPortal {
  id: string;
  el: HTMLDivElement;
  slot: Slot;
}

export const useCustomElementPortal = () => {
  const rawPortals = ref<RawPortal[]>([]);
  const portals = computed(() => {
    return rawPortals.value.map(item => {
      return h(Teleport, { to: item.el }, item.slot());
    });
  });

  const mount = (el: HTMLDivElement, slot: Slot) => {
    rawPortals.value.push({
      id: el.id,
      el,
      slot,
    });
  };

  const unmount = (el: HTMLDivElement | undefined) => {
    if (el) {
      const index = rawPortals.value.findIndex(portal => portal.id === el.id);
      if (index !== -1) {
        rawPortals.value.splice(index, 1);
      }
    }
  };

  return {
    portals,
    mount,
    unmount,
  };
};
