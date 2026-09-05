import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Reverification } from '../reverification';
import type { ReverificationController } from '../reverification.controller';
import type { ReverificationModel } from '../reverification.model';
import type { ReverificationViewProps } from '../reverification.types';

const model: ReverificationModel = {
  status: 'ready',
  isActive: true,
  supportEmail: '',
  start: vi.fn(),
  prepare: vi.fn(),
  attempt: vi.fn(),
  verifyPasskey: vi.fn(),
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
  ReverificationView: ({ step }: { step: string }) => <output data-testid='view'>{step}</output>,
}));

const active = {
  isActive: true as const,
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
    onVerifyPasskey: vi.fn(),
    onShowHelp: vi.fn(),
    onEmailSupport: vi.fn(),
    methods: [],
    onSelectMethod: vi.fn(),
    ...overrides,
  };
}

describe('Reverification', () => {
  it('renders nothing when reverification is not active', () => {
    controller = { status: 'idle' };
    const { container } = render(<Reverification isActive={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing while the controller is loading or unavailable', () => {
    controller = { status: 'loading' };
    const loading = render(<Reverification {...active} />);
    expect(loading.container).toBeEmptyDOMElement();

    controller = { status: 'unavailable' };
    const unavailable = render(<Reverification {...active} />);
    expect(unavailable.container).toBeEmptyDOMElement();
  });

  it('renders the view once the controller is ready', () => {
    controller = ready({ step: 'otp', otpChannel: 'email' });
    render(<Reverification {...active} />);
    expect(screen.getByTestId('view')).toHaveTextContent('otp');
  });
});
