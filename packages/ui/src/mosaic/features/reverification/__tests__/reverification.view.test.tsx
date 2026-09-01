import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { ReverificationViewProps } from '../reverification.types';
import { ReverificationView } from '../reverification.view';

function viewProps(overrides: Partial<ReverificationViewProps> = {}): ReverificationViewProps {
  return {
    step: 'password',
    value: '',
    onValueChange: vi.fn(),
    isPending: false,
    onSubmit: vi.fn(),
    onVerifyPasskey: vi.fn(),
    onShowMethods: vi.fn(),
    onShowHelp: vi.fn(),
    onEmailSupport: vi.fn(),
    methods: [],
    onSelectMethod: vi.fn(),
    ...overrides,
  };
}

function renderView(overrides: Partial<ReverificationViewProps> = {}) {
  return render(
    <MosaicProvider>
      <ReverificationView {...viewProps(overrides)} />
    </MosaicProvider>,
  );
}

describe('ReverificationView', () => {
  it('keeps one Card and Flow surface while view props and panels change', () => {
    const { container, rerender } = renderView();

    const card = container.querySelector('.cl-card-root');
    const flow = container.querySelector('.cl-flow-root');
    const passwordStep = screen.getByLabelText('Password').closest('.cl-flow-step');

    expect(card).not.toBeNull();
    expect(card).toContainElement(flow);
    expect(flow).toHaveAttribute('data-value', 'password');

    rerender(
      <MosaicProvider>
        <ReverificationView {...viewProps({ isPending: true })} />
      </MosaicProvider>,
    );

    expect(container.querySelector('.cl-card-root')).toBe(card);
    expect(container.querySelector('.cl-flow-root')).toBe(flow);
    expect(screen.getByLabelText('Password').closest('.cl-flow-step')).toBe(passwordStep);

    rerender(
      <MosaicProvider>
        <ReverificationView {...viewProps({ step: 'otp', otpChannel: 'totp', direction: -1 })} />
      </MosaicProvider>,
    );

    expect(container.querySelector('.cl-card-root')).toBe(card);
    expect(container.querySelector('.cl-flow-root')).toBe(flow);
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    const otpStep = screen.getByRole('group', { name: 'Verification code' }).closest('.cl-flow-step');
    expect(otpStep).toBeInTheDocument();
    expect(otpStep?.style.getPropertyValue('--cl-flow-transition-direction')).toBe('-1');
  });

  it('does not render Card branding', () => {
    renderView();

    expect(screen.queryByText('Secured by')).not.toBeInTheDocument();
  });

  it('renders a passkey attempt error in a negative Banner', () => {
    renderView({
      step: 'passkey',
      errorMessage: 'We couldn’t verify that passkey. Try again.',
    });

    const banner = screen.getByRole('alert');
    expect(banner).toHaveClass('cl-banner-root');
    expect(banner).toHaveAttribute('data-color', 'negative');
    expect(banner).toHaveTextContent('We couldn’t verify that passkey. Try again.');
  });
});
