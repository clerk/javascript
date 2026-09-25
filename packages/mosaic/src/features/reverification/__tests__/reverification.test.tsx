import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Reverification } from '../reverification';
import type { ReverificationController } from '../reverification.controller';
import type { ReverificationViewProps } from '../reverification.types';

let controller: ReverificationController = { status: 'idle', phase: 'inactive' };

vi.mock('../reverification.view', () => ({
  ReverificationPending: () => <output data-testid='pending' />,
  ReverificationUnavailable: () => <output data-testid='unavailable' />,
  ReverificationView: ({ step }: { step: string }) => <output data-testid='view'>{step}</output>,
}));

function ready(overrides: Partial<ReverificationViewProps> = {}): ReverificationController {
  return {
    status: 'ready',
    phase: 'active',
    step: 'password',
    value: '',
    onValueChange: vi.fn(),
    isPending: false,
    onSubmit: vi.fn(),
    onShowMethods: vi.fn(),
    onShowHelp: vi.fn(),
    onBack: vi.fn(),
    onEmailSupport: vi.fn(),
    onResend: vi.fn(),
    canResend: true,
    methods: [],
    onSelectMethod: vi.fn(),
    ...overrides,
  };
}

describe('Reverification', () => {
  it('renders nothing while reverification is inactive', () => {
    controller = { status: 'idle', phase: 'inactive' };
    const { container } = render(<Reverification {...controller} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders pending, unavailable, or the factor view', () => {
    controller = { status: 'loading', phase: 'active' };
    const { rerender } = render(<Reverification {...controller} />);
    expect(screen.getByTestId('pending')).toBeInTheDocument();
    expect(screen.queryByTestId('view')).not.toBeInTheDocument();

    controller = { status: 'unavailable', phase: 'active' };
    rerender(<Reverification {...controller} />);
    expect(screen.getByTestId('unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('view')).not.toBeInTheDocument();

    controller = ready({ step: 'otp', otpChannel: 'email' });
    rerender(<Reverification {...controller} />);
    expect(screen.getByTestId('view')).toHaveTextContent('otp');
  });

  it('keeps the factor flow mounted through retrying', () => {
    controller = ready({ isPending: true });
    const { rerender } = render(<Reverification {...controller} />);
    expect(screen.getByTestId('view')).toHaveTextContent('password');

    controller = { status: 'idle', phase: 'inactive' };
    rerender(<Reverification {...controller} />);
    expect(screen.queryByTestId('view')).not.toBeInTheDocument();
  });
});
