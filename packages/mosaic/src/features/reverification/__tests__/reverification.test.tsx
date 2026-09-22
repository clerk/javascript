import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Reverification } from '../reverification';
import type { ReverificationController } from '../reverification.controller';
import type { ReverificationModel } from '../reverification.model';
import type { ReverificationViewProps } from '../reverification.types';

const model: ReverificationModel = {
  status: 'ready',
  phase: 'active',
  supportEmail: '',
  start: vi.fn(),
  prepare: vi.fn(),
  attempt: vi.fn(),
  finish: vi.fn(),
  cancel: vi.fn(),
};

let controller: ReverificationController = { status: 'idle' };

vi.mock('../reverification.model', () => ({
  useReverificationModel: () => model,
}));

vi.mock('../reverification.controller', () => ({
  useReverificationController: () => controller,
}));

vi.mock('../reverification.view', () => ({
  ReverificationPending: () => <output data-testid='pending' />,
  ReverificationUnavailable: () => <output data-testid='unavailable' />,
  ReverificationView: ({ step, embedded }: { step: string; embedded?: boolean }) => (
    <output
      data-testid='view'
      data-embedded={embedded ? '' : undefined}
    >
      {step}
    </output>
  ),
}));

const active = {
  phase: 'active' as const,
  complete: vi.fn(),
  cancel: vi.fn(),
  level: 'first_factor' as const,
};

function ready(overrides: Partial<ReverificationViewProps> = {}): ReverificationController {
  return {
    status: 'ready',
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
    controller = { status: 'idle' };
    const { container } = render(<Reverification phase='inactive' />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders pending, unavailable, or the factor view', () => {
    controller = { status: 'loading' };
    const { rerender } = render(<Reverification {...active} />);
    expect(screen.getByTestId('pending')).toBeInTheDocument();
    expect(screen.queryByTestId('view')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);

    controller = { status: 'unavailable' };
    rerender(<Reverification {...active} />);
    expect(screen.getByTestId('unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('view')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);

    controller = ready({ step: 'otp', otpChannel: 'email' });
    rerender(<Reverification {...active} />);
    expect(screen.getByTestId('view')).toHaveTextContent('otp');
    expect(screen.getByTestId('view')).toHaveAttribute('data-embedded', '');
    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);
  });

  it('keeps the card flow mounted through retrying and can omit the card', () => {
    controller = ready({ isPending: true });
    const { rerender } = render(
      <Reverification
        embedded
        phase='retrying'
      />,
    );
    expect(screen.getByTestId('view')).toHaveTextContent('password');
    expect(screen.getByTestId('view')).toHaveAttribute('data-embedded', '');

    controller = { status: 'idle' };
    rerender(<Reverification phase='inactive' />);
    expect(screen.queryByTestId('view')).not.toBeInTheDocument();
  });
});
