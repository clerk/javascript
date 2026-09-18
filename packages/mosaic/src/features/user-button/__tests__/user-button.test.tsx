import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserButton } from '../user-button';
import type { UserButtonController } from '../user-button.controller';

let controller: UserButtonController;

const { useUserButtonModel, useCustomPages } = vi.hoisted(() => ({
  useUserButtonModel: vi.fn(() => ({ status: 'loading' })),
  useCustomPages: vi.fn(),
}));

vi.mock('../user-button.model', () => ({ useUserButtonModel }));

vi.mock('../user-button.controller', () => ({
  useUserButtonController: () => controller,
}));

// The two bridges are told apart by the built-in page list each was given.
vi.mock('../user-button.pages', () => ({
  useUserProfilePages: () => ['account'],
  useOrganizationProfilePages: () => ['general'],
  useCustomPages,
}));

// The wrapper's own job is which of the three controller states renders what, so the surface is
// stubbed out and the view's own tests cover it.
vi.mock('../user-button.view', () => ({
  UserButtonView: () => <output data-testid='view' />,
}));

function ready(): UserButtonController {
  return {
    status: 'ready',
    renderBranding: true,
    activeSession: { sessionId: 'sess_1', name: 'Alice Smith', identifier: 'alice@example.com' },
    activeOrganization: null,
    hasOrganizations: false,
    hidePersonal: false,
    organizationsLoading: false,
    memberships: [],
    suggestions: [],
    invitations: [],
    additionalSessions: [],
  };
}

describe('UserButton', () => {
  beforeEach(() => {
    controller = { status: 'loading' };
    useUserButtonModel.mockClear();
    useCustomPages.mockImplementation(({ builtInPages }: { builtInPages: readonly string[] }) => ({
      customPages: [{ label: `${builtInPages[0]}-page` }],
      portals: [
        <output
          key={builtInPages[0]}
          data-testid={`${builtInPages[0]}-portal`}
        />,
      ],
    }));
  });

  it('stands the fallback in while Clerk is still answering', () => {
    render(<UserButton fallback={<output data-testid='fallback' />} />);
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('view')).not.toBeInTheDocument();
  });

  // Signing out is an answer, not a wait. Holding the placeholder there would promise a button to
  // someone who is never going to get one.
  it('drops the fallback once nobody is signed in', () => {
    controller = { status: 'hidden' };
    render(<UserButton fallback={<output data-testid='fallback' />} />);
    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
    expect(screen.queryByTestId('view')).not.toBeInTheDocument();
  });

  it('renders the surface once the session is ready', () => {
    controller = ready();
    render(<UserButton fallback={<output data-testid='fallback' />} />);
    expect(screen.getByTestId('view')).toBeInTheDocument();
    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
  });

  it('renders no fallback while loading when none is given', () => {
    render(<UserButton />);
    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
    expect(screen.queryByTestId('view')).not.toBeInTheDocument();
  });

  it('keeps the custom page portals of both profiles mounted in every state', () => {
    const { rerender } = render(<UserButton />);
    expect(screen.getByTestId('account-portal')).toBeInTheDocument();
    expect(screen.getByTestId('general-portal')).toBeInTheDocument();

    controller = { status: 'hidden' };
    rerender(<UserButton />);
    expect(screen.getByTestId('account-portal')).toBeInTheDocument();
    expect(screen.getByTestId('general-portal')).toBeInTheDocument();

    controller = ready();
    rerender(<UserButton />);
    expect(screen.getByTestId('account-portal')).toBeInTheDocument();
    expect(screen.getByTestId('general-portal')).toBeInTheDocument();
  });

  it('hands the model each profile modal its props, and keeps the routing options apart', () => {
    const appearance = { variables: { colorPrimary: 'red' } };
    const additionalOAuthScopes = { google: ['https://www.googleapis.com/auth/calendar'] };
    const apiKeysProps = { showDescription: true };
    render(
      <UserButton
        afterLeaveOrganizationUrl='/left'
        userProfileProps={{ additionalOAuthScopes, apiKeysProps, appearance }}
        organizationProfileProps={{ appearance }}
      />,
    );

    expect(useUserButtonModel).toHaveBeenCalledWith(
      { afterLeaveOrganizationUrl: '/left' },
      {
        userProfile: { customPages: [{ label: 'account-page' }], additionalOAuthScopes, apiKeysProps, appearance },
        organizationProfile: { customPages: [{ label: 'general-page' }], appearance },
      },
    );
  });

  it('bridges each profile its own custom pages, ordered against its own built-in pages', () => {
    const page = { label: 'Usage', path: 'usage', content: <p>Usage</p> };
    render(
      <UserButton
        userProfileProps={{ customPages: [page], pageOrder: ['usage', 'account'] }}
        organizationProfileProps={{ customPages: [page], pageOrder: ['members', 'usage'] }}
      />,
    );

    expect(useCustomPages).toHaveBeenCalledWith({
      items: [page],
      order: ['usage', 'account'],
      builtInPages: ['account'],
    });
    expect(useCustomPages).toHaveBeenCalledWith({
      items: [page],
      order: ['members', 'usage'],
      builtInPages: ['general'],
    });
  });
});
