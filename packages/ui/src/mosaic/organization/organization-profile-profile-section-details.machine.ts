import { setup } from '../machine/setup';

export interface OrganizationProfileProfileSectionDetailsContext {
  /** The organization's current name, injected fresh each render. */
  committedName: string;
  /** The organization's current slug, injected fresh each render. */
  committedSlug: string;
  /** Whether the slug field is editable (mirrors `!organizationSettings.slug.disabled`). */
  slugEnabled: boolean;
  /** The user's edited name, or `null` while untouched (falls through to `committedName`). */
  draftName: string | null;
  /** The user's edited slug, or `null` while untouched (falls through to `committedSlug`). */
  draftSlug: string | null;
  error: string | null;
  updateOrganization: (params: { name: string; slug?: string }) => Promise<void>;
}

export type OrganizationProfileProfileSectionDetailsEvent =
  | { type: 'OPEN' }
  | { type: 'TYPE_NAME'; value: string }
  | { type: 'TYPE_SLUG'; value: string }
  | { type: 'SUBMIT' }
  | { type: 'CANCEL' };

// The draft holds the user's edits; a `null` draft transparently falls through to the committed
// value the controller re-injects each render. This is what lets the form seed itself from a
// late-loading organization without a syncing effect, and stop the committed value from clobbering
// edits once the user has typed.
const effectiveName = (context: OrganizationProfileProfileSectionDetailsContext): string =>
  context.draftName ?? context.committedName;
const effectiveSlug = (context: OrganizationProfileProfileSectionDetailsContext): string =>
  context.draftSlug ?? context.committedSlug;

const dataChanged = (context: OrganizationProfileProfileSectionDetailsContext): boolean =>
  effectiveName(context) !== context.committedName ||
  (context.slugEnabled && effectiveSlug(context) !== context.committedSlug);

const canSave = (context: OrganizationProfileProfileSectionDetailsContext): boolean =>
  dataChanged(context) && effectiveName(context).trim() !== '';

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileProfileSectionDetailsContext,
  OrganizationProfileProfileSectionDetailsEvent
>();

export const organizationProfileProfileSectionDetailsMachine = createMachine({
  id: 'organizationProfileDetails',
  initial: 'closed',
  context: {
    committedName: '',
    committedSlug: '',
    slugEnabled: true,
    draftName: null,
    draftSlug: null,
    error: null,
    updateOrganization: async () => {},
  },
  states: {
    closed: { on: { OPEN: 'editing' } },
    editing: {
      on: {
        TYPE_NAME: {
          actions: assign((_, event) => ({ draftName: event.value, error: null })),
        },
        TYPE_SLUG: {
          actions: assign((_, event) => ({ draftSlug: event.value, error: null })),
        },
        SUBMIT: {
          target: 'saving',
          guard: canSave,
        },
        // Discard the edits and close: the null drafts fall back through to the committed values.
        CANCEL: {
          target: 'closed',
          actions: assign(() => ({ draftName: null, draftSlug: null, error: null })),
        },
      },
    },
    saving: {
      invoke: fromPromise(
        context =>
          context.updateOrganization({
            name: effectiveName(context),
            ...(context.slugEnabled ? { slug: effectiveSlug(context) } : {}),
          }),
        {
          // Close and drop the drafts back to `null` on success: the organization resource is now
          // mutated, so the freshly re-injected committed values are the source of truth again.
          onDone: {
            target: 'closed',
            actions: assign(() => ({ draftName: null, draftSlug: null, error: null })),
          },
          onError: {
            target: 'editing',
            actions: assign((_, event) => ({
              error: event.error instanceof Error ? event.error.message : 'Something went wrong. Please try again.',
            })),
          },
        },
      ),
    },
  },
});
