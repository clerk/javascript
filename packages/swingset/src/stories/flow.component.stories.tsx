import { Button } from '@clerk/ui/mosaic/components/button';
import { Card } from '@clerk/ui/mosaic/components/card';
import { Flow, type FlowDirection } from '@clerk/ui/mosaic/components/flow';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './flow.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Flow',
  source: 'packages/ui/src/mosaic/components/flow/flow.tsx',
};

export function Default(): JSX.Element {
  const [step, setStep] = useState('details');
  const [direction, setDirection] = useState<FlowDirection>(1);

  const navigate = (nextStep: string, nextDirection: FlowDirection) => {
    setDirection(nextDirection);
    setStep(nextStep);
  };

  return (
    <Card.Root>
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
                <Card.Description>Review the final step before submitting.</Card.Description>
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
