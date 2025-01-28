import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/vue';
import { vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';

import SignInWithMetamaskButton from '../SignInWithMetamaskButton.vue';

const mockAuthenticatewithMetamask = vi.fn();
const originalError = console.error;

vi.mock('../../composables/useClerk', () => ({
  useClerk: () =>
    ref({
      authenticateWithMetamask: mockAuthenticatewithMetamask,
    }),
}));

const url = 'https://www.clerk.com';

describe('<SignInWithMetamaskButton />', () => {
  beforeAll(() => {
    console.error = vi.fn();
  });

  beforeEach(() => {
    mockAuthenticatewithMetamask.mockReset();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('calls clerk.authenticateWithMetamask when clicked', async () => {
    render(SignInWithMetamaskButton);
    const btn = screen.getByText('Sign in with Metamask');
    await userEvent.click(btn);

    expect(mockAuthenticatewithMetamask).toHaveBeenCalled();
  });

  it('handles redirectUrl prop', async () => {
    render(SignInWithMetamaskButton, {
      props: {
        redirectUrl: url,
      },
    });
    const btn = screen.getByText('Sign in with Metamask');
    await userEvent.click(btn);

    expect(mockAuthenticatewithMetamask).toHaveBeenCalledWith({ redirectUrl: url });
  });

  it('uses text passed as children', async () => {
    const Button = defineComponent(() => {
      return () => h(SignInWithMetamaskButton, () => 'text');
    });
    render(Button);
    screen.getByText('text');
  });

  it('throws if multiple children provided', async () => {
    const Button = defineComponent(() => {
      return () =>
        h(SignInWithMetamaskButton, () => [h('button', { type: 'button' }, '1'), h('button', { type: 'button' }, '2')]);
    });

    expect(() => {
      render(Button);
    }).toThrow();
  });
});
