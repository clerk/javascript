import { setup } from '../machine/setup';

/**
 * The verify-domain step's "add a domain" flow, ported 1:1 from
 * `OrganizationDomainsStep.tsx` `handleCreateDomain` + `DomainsField`/`DomainSuggestion`.
 *
 * Legacy keeps the submit spinner as component-local `useState` and the typed value in a
 * form control, clearing it only on success (`.then(() => field.setValue(''))`) and keeping
 * it on error so the user can fix and retry. Here the draft lives in context so the machine
 * owns that clear-on-success / keep-on-error rule, exactly like the domains-section
 * add-verify machine.
 *
 * The field and the suggestion both create through the single `SUBMIT { name }` event (the
 * suggestion passes its email-derived domain; the field passes the draft). This is one
 * machine, so the two Add buttons share the `creating` spinner rather than legacy's two
 * independent `isSubmitting` flags — a cosmetic difference only, since the suggestion renders
 * only while the list is empty and both submit the same create.
 */
export interface OrganizationProfileSecurityWizardDomainsAddContext {
  /** The controlled add-field value; persisted here so it survives a failed create. */
  draftName: string;
  /** The name currently being created (draft or suggestion), forwarded to the mutation. */
  pendingName: string;
  error: string | null;
  createDomain: (name: string) => Promise<void>;
}

export type OrganizationProfileSecurityWizardDomainsAddEvent =
  | { type: 'TYPE_NAME'; value: string }
  | { type: 'SUBMIT'; name: string };

/**
 * Matches a bare domain such as `example.com` or `sub.example.co.uk` — ported verbatim from
 * `OrganizationDomainsStep.tsx`. Protocols, paths, ports, spaces and single-label hostnames
 * are rejected.
 */
const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
export const isValidDomain = (value: string): boolean => DOMAIN_REGEX.test(value.trim().toLowerCase());

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileSecurityWizardDomainsAddContext,
  OrganizationProfileSecurityWizardDomainsAddEvent
>();

export const organizationProfileSecurityWizardDomainsAddMachine = createMachine({
  id: 'securityWizardDomainsAdd',
  initial: 'idle',
  context: {
    draftName: '',
    pendingName: '',
    error: null,
    createDomain: async () => {},
  },
  states: {
    idle: {
      on: {
        TYPE_NAME: {
          actions: assign((_, event) => ({ draftName: event.value, error: null })),
        },
        SUBMIT: {
          target: 'creating',
          // Defense in depth: the view also blocks duplicate / empty names (it holds the
          // domain list); the machine still refuses an invalid domain on its own.
          guard: (_, event) => isValidDomain(event.name),
          actions: assign((_, event) => ({ pendingName: event.name.trim().toLowerCase(), error: null })),
        },
      },
    },
    creating: {
      invoke: fromPromise(context => context.createDomain(context.pendingName), {
        // Clear the field on success (legacy `field.setValue('')`); keep it on error so the
        // user can correct and retry.
        onDone: {
          target: 'idle',
          actions: assign(() => ({ draftName: '', pendingName: '', error: null })),
        },
        onError: {
          target: 'idle',
          actions: assign((_, event) => ({
            pendingName: '',
            error: event.error instanceof Error ? event.error.message : 'Something went wrong. Please try again.',
          })),
        },
      }),
    },
  },
});
