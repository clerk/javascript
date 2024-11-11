import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/vue';
import { vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';

import { SignOutButton } from '../SignOutButton';

const mockSignOut = vi.fn();
const originalError = console.error;

vi.mock('../../composables/useClerk', () => ({
  useClerk: () =>
    ref({
      signOut: mockSignOut,
    }),
}));

const url = 'https://www.clerk.com';

describe('<SignOutButton />', () => {
  beforeAll(() => {
    console.error = vi.fn();
  });

  beforeEach(() => {
    mockSignOut.mockReset();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('calls clerk.signOutOne when clicked', async () => {
    render(SignOutButton);
    const btn = screen.getByText('Sign out');
    await userEvent.click(btn);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('handles redirectUrl prop', async () => {
    render(SignOutButton, {
      props: {
        redirectUrl: url,
      },
    });
    const btn = screen.getByText('Sign out');
    await userEvent.click(btn);

    expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: url });
  });

  it('handles signOutOptions prop', async () => {
    render(SignOutButton, {
      props: {
        redirectUrl: url,
        sessionId: 'sess_1yDceUR8SIKtQ0gIOO8fNsW7nhe',
      },
    });
    const btn = screen.getByText('Sign out');
    await userEvent.click(btn);

    expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: url, sessionId: 'sess_1yDceUR8SIKtQ0gIOO8fNsW7nhe' });
  });

  it('uses text passed as children', async () => {
    const Button = defineComponent(() => {
      return () => h(SignOutButton, () => 'text');
    });
    render(Button);
    screen.getByText('text');
  });

  it('throws if multiple children provided', async () => {
    const Button = defineComponent(() => {
      return () => h(SignOutButton, () => [h('button', { type: 'button' }, '1'), h('button', { type: 'button' }, '2')]);
    });

    expect(() => {
      render(Button);
    }).toThrow();
  });
});
