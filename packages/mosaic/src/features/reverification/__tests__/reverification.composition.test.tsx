import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { Flow } from '../../../components/flow';
import { mockActor } from '../../../machine/createActor';
import type { AnyActor } from '../../../machine/types';
import { MosaicProvider } from '../../../MosaicProvider';
import { Reverification } from '../reverification';
import { reverificationMachine } from '../reverification.machine';
import type { ReverificationMethod } from '../reverification.types';

vi.mock('../../../hooks/useMosaicSupportEmail', () => ({
  useMosaicSupportEmail: () => 'support@example.com',
}));

const password: ReverificationMethod = { id: 'password', stage: 'first', strategy: 'password' };

let actor: AnyActor | undefined;

function at(value: string): AnyActor {
  return mockActor(reverificationMachine, { value, context: { activeMethod: password, methods: [password] } });
}

function surface(): AnyActor {
  return at('factor.editing.ready');
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
                    <Reverification actor={actor} />
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

describe('reverification inside an outer flow', () => {
  it('keeps one dialog and one card, and nests a flow only while verifying', () => {
    actor = undefined;
    const { rerender } = render(<Nested step='confirm' />);

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);
    expect(document.querySelectorAll('.cl-flow-root')).toHaveLength(1);
    expect(document.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'confirm');
    expect(screen.getByText('Confirm the mock delete.')).toBeInTheDocument();

    actor = mockActor(reverificationMachine, { value: 'starting' });
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
    actor = surface();
    rerender(<Nested step='verify' />);

    const nextFlows = document.querySelectorAll('.cl-flow-root');
    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);
    expect(document.querySelector('.cl-card-root')).toBe(outerCard);
    expect(nextFlows).toHaveLength(2);
    expect(nextFlows[0]).toBe(outerFlow);
    expect(nextFlows[1]).toHaveAttribute('data-value', 'password');
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.queryByText('Confirm the mock delete.')).not.toBeInTheDocument();

    actor = undefined;
    rerender(<Nested step='finalizing' />);

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);
    expect(document.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'finalizing');
    expect(screen.getByRole('heading', { name: 'Finalizing' })).toBeInTheDocument();
    expect(screen.queryByText('Confirm the mock delete.')).not.toBeInTheDocument();
  });

  it('keeps the current step when the challenge goes inactive', () => {
    actor = surface();
    const { rerender } = render(<Nested step='verify' />);

    expect(document.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'verify');
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    actor = undefined;
    rerender(<Nested step='verify' />);

    expect(document.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'verify');
    expect(screen.queryByText('Confirm the mock delete.')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  });

  it('does not mount an inner flow before verification starts', () => {
    actor = surface();
    const { rerender } = render(<Nested step='finalizing' />);

    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);
    expect(document.querySelectorAll('.cl-flow-root')).toHaveLength(1);
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();

    rerender(<Nested step='confirm' />);
    expect(document.querySelectorAll('.cl-flow-root')).toHaveLength(1);
    expect(document.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'confirm');
  });
});

describe('reverification card states', () => {
  it('keeps one card from the pending state through a factor', () => {
    actor = mockActor(reverificationMachine, { value: 'starting' });
    const { container, rerender } = render(
      <MosaicProvider>
        <Card.Root renderBranding={false}>
          <Reverification actor={actor} />
        </Card.Root>
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

    actor = surface();
    rerender(
      <MosaicProvider>
        <Card.Root renderBranding={false}>
          <Reverification actor={actor} />
        </Card.Root>
      </MosaicProvider>,
    );

    expect(container.querySelector('.cl-card-root')).toBe(card);
    expect(container.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'password');
    expect(container.querySelector('.cl-spinner')).toBeNull();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('shows a dismiss button on the pending card inside a dialog', () => {
    actor = mockActor(reverificationMachine, { value: 'starting' });
    render(
      <MosaicProvider>
        <Dialog.Root open>
          <Dialog.Popup>
            <Card.Root renderBranding={false}>
              <Reverification actor={actor} />
            </Card.Root>
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Verification required');
    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);
  });

  it('renders unavailable outside the factor flow, then mounts that flow in the same card', () => {
    actor = at('unavailable');
    const { container, rerender } = render(
      <MosaicProvider>
        <Card.Root renderBranding={false}>
          <Reverification actor={actor} />
        </Card.Root>
      </MosaicProvider>,
    );
    const card = container.querySelector('.cl-card-root');

    expect(card).not.toBeNull();
    expect(container.querySelector('.cl-flow-root')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Cannot verify your account' })).toBeInTheDocument();
    expect(
      screen.getByText('Cannot proceed with verification. No suitable authentication factor is configured.'),
    ).toBeInTheDocument();

    actor = surface();
    rerender(
      <MosaicProvider>
        <Card.Root renderBranding={false}>
          <Reverification actor={actor} />
        </Card.Root>
      </MosaicProvider>,
    );

    expect(container.querySelector('.cl-card-root')).toBe(card);
    expect(container.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'password');
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });
});
