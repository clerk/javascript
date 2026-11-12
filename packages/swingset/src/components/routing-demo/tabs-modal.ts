import { defineModalSurface } from '@clerk/mosaic/modals/define-modal-surface';

export interface TabsModalOptions {
  /** Open on this tab instead of the first one. */
  tab?: 'invitations' | 'settings';
}

/** A modal whose content is routed tabs, so the open tab is part of the modal's entry. */
export const tabsModal = defineModalSurface<TabsModalOptions>({
  id: 'tabs',
  variant: 'card',
  load: () => import('./tabs-modal-content'),
  initialParts: options => (options?.tab === undefined ? [] : [options.tab]),
});
