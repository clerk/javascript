import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/vue';
import { vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';

import SignUpButton from '../SignUpButton.vue';

const mockRedirectToSignUp = vi.fn();
const originalError = console.error;

vi.mock('../../composables/useClerk', () => ({
  useClerk: () =>
    ref({
      redirectToSignUp: mockRedirectToSignUp,
    }),
}));

const url = 'https://www.clerk.com';

describe('<SignUpButton />', () => {
  beforeAll(() => {
    console.error = vi.fn();
  });

  beforeEach(() => {
    mockRedirectToSignUp.mockReset();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('calls clerk.redirectToSignUp when clicked', async () => {
    render(SignUpButton);
    const btn = screen.getByText('Sign up');
    await userEvent.click(btn);

    expect(mockRedirectToSignUp).toHaveBeenCalled();
  });

  it('handles forceRedirectUrl prop', async () => {
    render(SignUpButton, {
      props: {
        forceRedirectUrl: url,
      },
    });
    const btn = screen.getByText('Sign up');
    await userEvent.click(btn);

    expect(mockRedirectToSignUp).toHaveBeenCalledWith({ forceRedirectUrl: url, signUpForceRedirectUrl: url });
  });

  it('handles fallbackRedirectUrl prop', async () => {
    render(SignUpButton, {
      props: {
        fallbackRedirectUrl: url,
      },
    });
    const btn = screen.getByText('Sign up');
    await userEvent.click(btn);

    expect(mockRedirectToSignUp).toHaveBeenCalledWith({
      fallbackRedirectUrl: url,
      signUpFallbackRedirectUrl: url,
    });
  });

  it('renders passed button and calls both click handlers', async () => {
    const handler = vi.fn();

    const Button = defineComponent(() => {
      return () => h(SignUpButton, null, () => h('button', { onClick: handler, type: 'button' }, 'custom button'));
    });

    render(Button);

    const btn = screen.getByText('custom button');
    await userEvent.click(btn);

    expect(handler).toHaveBeenCalled();
    expect(mockRedirectToSignUp).toHaveBeenCalled();
  });

  it('uses text passed as children', async () => {
    const Button = defineComponent(() => {
      return () => h(SignUpButton, () => 'text');
    });
    render(Button);
    screen.getByText('text');
  });

  it('throws if multiple children provided', async () => {
    const Button = defineComponent(() => {
      return () => h(SignUpButton, () => [h('button', { type: 'button' }, '1'), h('button', { type: 'button' }, '2')]);
    });

    expect(() => {
      render(Button);
    }).toThrow();
  });
});
