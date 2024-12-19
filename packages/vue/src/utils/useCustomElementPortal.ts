import type { Slot } from 'vue';
import { computed, h, ref, Teleport } from 'vue';

interface RawPortal {
  id: string;
  el: HTMLDivElement;
  slot: Slot;
}

function generateElementIdentifier() {
  return Math.random().toString(36).substring(2, 7);
}

export const useCustomElementPortal = () => {
  const rawPortals = ref<RawPortal[]>([]);
  const portals = computed(() => {
    return rawPortals.value.map(item => {
      return h(Teleport, { to: item.el }, item.slot());
    });
  });

  const mount = (el: HTMLDivElement, slot: Slot) => {
    const id = generateElementIdentifier();
    el.setAttribute('data-clerk-mount-id', id);
    rawPortals.value.push({
      id,
      el,
      slot,
    });
  };

  const unmount = (el: HTMLDivElement | undefined) => {
    const id = el?.getAttribute('data-clerk-mount-id');
    if (id) {
      const index = rawPortals.value.findIndex(portal => portal.id === id);
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
