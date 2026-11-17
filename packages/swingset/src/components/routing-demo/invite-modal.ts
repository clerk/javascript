import { defineModalSurface } from '@clerk/mosaic/modals/define-modal-surface';

/** The invite flow in a modal: the same component as on the page, routed under the modal's base instead. */
export const inviteModal = defineModalSurface<undefined>({
  id: 'invite',
  variant: 'card',
  load: () => import('./invite-modal-content'),
});
