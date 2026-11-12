import { defineModalSurface } from '@clerk/mosaic/modals/define-modal-surface';

export interface DemoModalOptions {
  /** Open on the details step instead of the first one. */
  step?: 'details';
}

/** A modal with nothing in it but two steps and a button that opens another modal. */
export const demoModal = defineModalSurface<DemoModalOptions>({
  id: 'demo',
  variant: 'card',
  load: () => import('./demo-modal-content'),
  initialParts: options => (options?.step === undefined ? [] : [options.step]),
});

/** The modal the demo modal opens on top of itself. */
export const innerModal = defineModalSurface<undefined>({
  id: 'inner',
  variant: 'card',
  load: () => import('./inner-modal-content'),
});
