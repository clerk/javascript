import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserButton } from '../user-button';
import type { UserButtonController } from '../user-button.controller';

let controller: UserButtonController;

vi.mock('../user-button.model', () => ({
  useUserButtonModel: () => ({ status: 'loading' }),
}));

vi.mock('../user-button.controller', () => ({
  useUserButtonController: () => controller,
}));

// The custom pages outlive the popup, so the wrapper renders their portals in every state.
vi.mock('../user-button.pages', () => ({
  useUserProfilePages: () => [],
  useCustomPages: () => ({
    customPages: undefined,
    portals: [
      <output
        key='p'
        data-testid='portal'
      />,
    ],
  }),
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

  // The profile can be open in clerk-js's own root while the button itself has nothing to render.
  it('keeps the custom page portals mounted in every state', () => {
    const { rerender } = render(<UserButton />);
    expect(screen.getByTestId('portal')).toBeInTheDocument();

    controller = { status: 'hidden' };
    rerender(<UserButton />);
    expect(screen.getByTestId('portal')).toBeInTheDocument();

    controller = ready();
    rerender(<UserButton />);
    expect(screen.getByTestId('portal')).toBeInTheDocument();
  });
});
