import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserButton } from '../user-button';
import type { UserButtonController } from '../user-button.controller';

let controller: UserButtonController;

vi.mock('../user-button.controller', () => ({
  useUserButtonController: () => controller,
}));

// The container's own job is which of the three controller states renders what, so the surface is
// stubbed out and the view's own tests cover it.
vi.mock('../user-button.view', () => ({
  userButtonBusyKeys: {
    selectOrganization: () => 'select-organization',
    switchSession: () => 'switch-session',
    signOutSession: () => 'sign-out-session',
    signOutAll: () => 'sign-out-all',
    acceptSuggestion: () => 'accept-suggestion',
    acceptInvitation: () => 'accept-invitation',
  },
  UserButtonView: () => <output data-testid='view' />,
}));

function ready(): UserButtonController {
  return {
    status: 'ready',
    organizationsEnabled: true,
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

  it('renders nothing while loading when no fallback is given', () => {
    const { container } = render(<UserButton />);
    expect(container).toBeEmptyDOMElement();
  });
});
