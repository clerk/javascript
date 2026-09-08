'use client';

import { Flow, type FlowDirection } from '@clerk/headless/flow';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Primitives',
  title: 'Flow',
  source: 'packages/headless/src/primitives/flow/index.ts',
};

const steps = [
  {
    id: 'account',
    title: 'Account details',
    description: 'Confirm the account that this action applies to.',
  },
  {
    id: 'verification',
    title: 'Verify your identity',
    description:
      'Enter the verification code sent to your primary email address. The additional copy makes this step taller so the viewport height transition is visible.',
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Your identity has been verified.',
  },
] as const;

export function Default() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<FlowDirection>(1);

  const moveTo = (nextIndex: number) => {
    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActiveIndex(nextIndex);
  };

  return (
    <div className='flow-demo'>
      <div className='flow-demo-controls'>
        <button
          type='button'
          disabled={activeIndex === 0}
          onClick={() => moveTo(activeIndex - 1)}
        >
          Previous
        </button>
        <span>
          Step {activeIndex + 1} of {steps.length}
        </span>
        <button
          type='button'
          disabled={activeIndex === steps.length - 1}
          onClick={() => moveTo(activeIndex + 1)}
        >
          Next
        </button>
      </div>

      <Flow.Root
        value={steps[activeIndex].id}
        direction={direction}
        className='flow-demo-root'
      >
        {steps.map(step => (
          <Flow.Step
            key={step.id}
            ids={[step.id]}
            className='flow-demo-step'
          >
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </Flow.Step>
        ))}
      </Flow.Root>

      <style>{`
        .flow-demo {
          width: min(100%, 26.25rem);
        }

        .flow-demo-controls {
          align-items: center;
          display: flex;
          justify-content: space-between;
          margin-block-end: 1rem;
        }

        .flow-demo-controls button {
          border: 1px solid currentColor;
          border-radius: 0.375rem;
          padding: 0.375rem 0.75rem;
        }

        .flow-demo-controls button:disabled {
          opacity: 0.4;
        }

        .flow-demo-root {
          height: var(--cl-flow-step-height, auto);
          overflow: hidden;
          position: relative;
          transition: height 240ms ease;
        }

        .flow-demo-root[data-initial] {
          transition: none;
        }

        .flow-demo-step {
          border: 1px solid currentColor;
          border-radius: 0.75rem;
          box-sizing: border-box;
          padding: 1.25rem;
          transition: opacity 180ms ease, transform 240ms ease;
          width: 100%;
        }

        .flow-demo-step[data-closed] {
          inset: 0;
          position: absolute;
        }

        .flow-demo-step[data-starting-style] {
          opacity: 0;
          transform: translateX(calc(var(--cl-flow-transition-direction) * 1.5rem));
        }

        .flow-demo-step[data-ending-style] {
          opacity: 0;
          transform: translateX(calc(var(--cl-flow-transition-direction) * -1.5rem));
        }

        @media (prefers-reduced-motion: reduce) {
          .flow-demo-root,
          .flow-demo-step {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
