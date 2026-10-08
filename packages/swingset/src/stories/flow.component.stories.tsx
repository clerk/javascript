import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import { Flow, type FlowDirection } from '@clerk/mosaic/components/flow';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './flow.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Flow',
  source: 'packages/mosaic/src/components/flow/flow.tsx',
};

function FlowDemo(): JSX.Element {
  const [step, setStep] = useState('details');
  const [direction, setDirection] = useState<FlowDirection>(1);

  const navigate = (nextStep: string, nextDirection: FlowDirection) => {
    setDirection(nextDirection);
    setStep(nextStep);
  };

  return (
    <Card.Root renderBranding={false}>
      <Flow.Root
        value={step}
        direction={direction}
        state={{ step }}
      >
        {state => (
          <>
            <Flow.Step ids={['details', 'details-pending']}>
              <Card.Header>
                <Card.Title>Account details</Card.Title>
                <Card.Description>Current controller state: {state.step}</Card.Description>
              </Card.Header>
              <Card.Footer>
                <Button
                  fullWidth
                  onClick={() => navigate('confirm', 1)}
                >
                  Continue
                </Button>
              </Card.Footer>
            </Flow.Step>
            <Flow.Step ids={['confirm']}>
              <Card.Header>
                <Card.Title>Confirm changes</Card.Title>
                <Card.Description>
                  Review the final step before submitting. Changes apply to every session on this account, and members
                  are notified by email once they take effect.
                </Card.Description>
              </Card.Header>
              <Card.Footer>
                <Button
                  fullWidth
                  variant='outline'
                  color='neutral'
                  onClick={() => navigate('details', -1)}
                >
                  Back
                </Button>
                <Button fullWidth>Submit</Button>
              </Card.Footer>
            </Flow.Step>
          </>
        )}
      </Flow.Root>
    </Card.Root>
  );
}

export function Default(): JSX.Element {
  return <FlowDemo />;
}

export function Customized(): JSX.Element {
  return (
    <div>
      <style>{`
        @scope {
          .cl-flow-step {
            opacity: 1 !important;
            transform: translateX(0) !important;
            transition-delay: 0s !important;
            transition-duration: var(--cl-duration-slow) !important;
            transition-property: transform !important;
            transition-timing-function: var(--cl-ease-enter) !important;
          }
          .cl-flow-step[data-starting-style] {
            transform: translateX(calc(var(--cl-flow-transition-direction) * 100%)) !important;
          }
          .cl-flow-step[data-ending-style] {
            transform: translateX(calc(var(--cl-flow-transition-direction) * -100%)) !important;
          }
          @media (prefers-reduced-motion: reduce) {
            .cl-flow-step,
            .cl-flow-step[data-starting-style],
            .cl-flow-step[data-ending-style] {
              transform: none !important;
              transition-property: none !important;
            }
          }
        }
      `}</style>
      <FlowDemo />
    </div>
  );
}
