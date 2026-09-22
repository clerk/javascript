import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { Flow } from '../../../components/flow';
import { MosaicProvider } from '../../../MosaicProvider';
import { Reverification } from '../reverification';
import type { ReverificationController } from '../reverification.controller';
import type { ReverificationViewProps } from '../reverification.types';

let controller: ReverificationController = { status: 'idle' };

vi.mock('../reverification.model', () => ({
  useReverificationModel: () => ({
    status: 'ready',
    phase: 'active',
    supportEmail: 'support@example.com',
    start: vi.fn(),
    prepare: vi.fn(),
    attempt: vi.fn(),
    finish: vi.fn(),
    cancel: vi.fn(),
  }),
}));

vi.mock('../reverification.controller', () => ({
  useReverificationController: () => controller,
}));

function surface(overrides: Partial<ReverificationViewProps> = {}): ReverificationController {
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

function Nested({ step }: { step: 'confirm' | 'verify' | 'finalizing' }) {
  return (
    <MosaicProvider>
      <Dialog.Root open>
        <Dialog.Popup>
          <Card.Root
            elevation='overlay'
            renderBranding={false}
          >
            <Flow.Root
              value={step}
              direction={1}
              state={{ step }}
            >
              {() => (
                <>
                  <Flow.Step ids={['confirm']}>
                    <Card.Header>
                      <Card.Title>Delete account?</Card.Title>
                      <Card.Description>Confirm the mock delete.</Card.Description>
                    </Card.Header>
                  </Flow.Step>
                  <Flow.Step ids={['verify']}>
                    <Reverification
                      embedded
                      phase='active'
                      complete={vi.fn()}
                      cancel={vi.fn()}
                      level='first_factor'
                    />
                  </Flow.Step>
                  <Flow.Step ids={['finalizing']}>
                    <Card.Header>
                      <Card.Title>Finalizing</Card.Title>
                      <Card.Description>Completing the mock delete.</Card.Description>
                    </Card.Header>
                  </Flow.Step>
                </>
              )}
            </Flow.Root>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>
    </MosaicProvider>
  );
}

describe('embedded reverification inside an outer flow', () => {
  it('keeps one dialog and one card, and nests a flow only while verifying', () => {
    controller = { status: 'idle' };
    const { rerender } = render(<Nested step='confirm' />);

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);
    expect(document.querySelectorAll('.cl-flow-root')).toHaveLength(1);
    expect(document.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'confirm');
    expect(screen.getByText('Confirm the mock delete.')).toBeInTheDocument();

    controller = { status: 'loading' };
    rerender(<Nested step='verify' />);

    const flows = document.querySelectorAll('.cl-flow-root');
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);
    expect(flows).toHaveLength(1);
    expect(flows[0]).toHaveAttribute('data-value', 'verify');
    expect(screen.queryByText('Confirm the mock delete.')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(document.querySelector('.cl-spinner')).not.toBeNull();

    const outerCard = document.querySelector('.cl-card-root');
    const outerFlow = flows[0];
    controller = surface();
    rerender(<Nested step='verify' />);

    const nextFlows = document.querySelectorAll('.cl-flow-root');
    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);
    expect(document.querySelector('.cl-card-root')).toBe(outerCard);
    expect(nextFlows).toHaveLength(2);
    expect(nextFlows[0]).toBe(outerFlow);
    expect(nextFlows[1]).toHaveAttribute('data-value', 'password');
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.queryByText('Confirm the mock delete.')).not.toBeInTheDocument();

    controller = { status: 'idle' };
    rerender(<Nested step='finalizing' />);

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);
    expect(document.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'finalizing');
    expect(screen.getByRole('heading', { name: 'Finalizing' })).toBeInTheDocument();
    expect(screen.queryByText('Confirm the mock delete.')).not.toBeInTheDocument();
  });

  it('keeps the current step when the challenge goes inactive', () => {
    controller = surface();
    const { rerender } = render(<Nested step='verify' />);

    expect(document.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'verify');
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    controller = { status: 'idle' };
    rerender(<Nested step='verify' />);

    expect(document.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'verify');
    expect(screen.queryByText('Confirm the mock delete.')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  });

  it('does not mount an inner flow before verification starts', () => {
    controller = surface();
    const { rerender } = render(<Nested step='finalizing' />);

    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);
    expect(document.querySelectorAll('.cl-flow-root')).toHaveLength(1);
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();

    rerender(<Nested step='confirm' />);
    expect(document.querySelectorAll('.cl-flow-root')).toHaveLength(1);
    expect(document.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'confirm');
  });
});

const active = {
  phase: 'active' as const,
  complete: vi.fn(),
  cancel: vi.fn(),
  level: 'first_factor' as const,
};

describe('reverification card states', () => {
  it('keeps one card from the pending state through a factor', () => {
    controller = { status: 'loading' };
    const { container, rerender } = render(
      <MosaicProvider>
        <Reverification {...active} />
      </MosaicProvider>,
    );
    const card = container.querySelector('.cl-card-root');
    const spinner = container.querySelector('.cl-spinner');

    expect(card).not.toBeNull();
    expect(container.querySelector('.cl-flow-root')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Verification required' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(container.querySelector('[aria-busy="true"]')).toContainElement(spinner);
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();

    controller = surface();
    rerender(
      <MosaicProvider>
        <Reverification {...active} />
      </MosaicProvider>,
    );

    expect(container.querySelector('.cl-card-root')).toBe(card);
    expect(container.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'password');
    expect(container.querySelector('.cl-spinner')).toBeNull();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('shows a dismiss button on the pending card inside a dialog', () => {
    controller = { status: 'loading' };
    render(
      <MosaicProvider>
        <Dialog.Root open>
          <Dialog.Popup>
            <Reverification
              embedded
              {...active}
            />
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Verification required');
    expect(document.querySelector('.cl-card-root')).toBeNull();
  });

  it('renders unavailable outside the factor flow, then mounts that flow in the same card', () => {
    controller = { status: 'unavailable' };
    const { container, rerender } = render(
      <MosaicProvider>
        <Reverification {...active} />
      </MosaicProvider>,
    );
    const card = container.querySelector('.cl-card-root');

    expect(card).not.toBeNull();
    expect(container.querySelector('.cl-flow-root')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Cannot verify your account' })).toBeInTheDocument();
    expect(
      screen.getByText('Cannot proceed with verification. No suitable authentication factor is configured.'),
    ).toBeInTheDocument();

    controller = surface();
    rerender(
      <MosaicProvider>
        <Reverification {...active} />
      </MosaicProvider>,
    );

    expect(container.querySelector('.cl-card-root')).toBe(card);
    expect(container.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'password');
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });
});
