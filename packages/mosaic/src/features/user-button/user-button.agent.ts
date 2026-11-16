import type { AgentSurface } from '../../agent/create-agent';
import { action } from '../../agent/create-agent';
import { optional, string } from '../../agent/input';
import type { SwitcherModel } from '../switcher/switcher.model';

type ReadyModel = Extract<SwitcherModel, { status: 'ready' }>;

export function userButtonAgent(model: ReadyModel, { combined }: { combined: boolean }): AgentSurface {
  const organizations = combined && model.organizationsEnabled;
  const { onSelectOrganization, onSwitchSession, onPersistSession, onManageAccount, onSignOutSession } = model;
  return {
    component: 'userButton',
    label: model.activeSession.name,
    pending: () => model.isOpeningProfile,
    state: () => ({
      activeAccount: withoutImage(model.activeSession),
      otherAccounts: model.additionalSessions.map(withoutImage),
      ...(organizations && {
        activeOrganization: model.activeOrganization && withoutImage(model.activeOrganization),
        organizations: model.memberships.map(withoutImage),
      }),
    }),
    actions: {
      switchAccount:
        onSwitchSession &&
        model.additionalSessions.length > 0 &&
        action({
          description: 'Switches to another signed-in account from otherAccounts.',
          input: { sessionId: string('The sessionId of an account in otherAccounts') },
          run: async ({ sessionId }) => {
            await onSwitchSession(sessionId);
            await onPersistSession('select_session');
          },
        }),
      switchOrganization:
        organizations &&
        onSelectOrganization &&
        action({
          description: 'Makes an organization the active one, or the personal account when organizationId is left out.',
          input: { organizationId: optional(string('The organizationId of one of organizations')) },
          run: async ({ organizationId }) => {
            await onSelectOrganization(organizationId ?? null);
            await onPersistSession('select_org');
          },
        }),
      openProfile:
        onManageAccount &&
        action({
          description:
            "Opens the signed-in user's profile, where they manage their name, emails, password and security.",
          run: () => onManageAccount(),
        }),
      signOut:
        onSignOutSession &&
        action({
          description: 'Signs out one account: the active one, or the account whose sessionId is given.',
          input: { sessionId: optional(string('The sessionId of a signed-in account')) },
          confirm: 'Signs the person out of their account',
          run: ({ sessionId }) => onSignOutSession(sessionId ?? model.activeSession.sessionId),
        }),
    },
  };
}

function withoutImage<T extends { imageUrl?: unknown }>({ imageUrl: _imageUrl, ...rest }: T): Omit<T, 'imageUrl'> {
  return rest;
}
