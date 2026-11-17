import { defineModalSurface } from '@clerk/mosaic/modals/define-modal-surface';

export interface DomainModalOptions {
  /** Open on the verification step instead of the first one. */
  step?: 'verify';
}

/** An "add a domain" modal with nothing behind it but two steps and a button that opens a help modal on top. */
export const domainModal = defineModalSurface<DomainModalOptions>({
  id: 'domain',
  variant: 'card',
  load: () => import('./demo-modal-content'),
  initialParts: options => (options?.step === undefined ? [] : [options.step]),
});

/** The help modal the domain modal opens on top of itself. */
export const dnsHelpModal = defineModalSurface<undefined>({
  id: 'dnsHelp',
  variant: 'card',
  load: () => import('./inner-modal-content'),
});
