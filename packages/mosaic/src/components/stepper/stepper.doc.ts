import type { ComponentDoc } from '../../docs-schema';
import type { StepperProps } from './stepper';

export default {
  name: 'Stepper',
  description:
    'Shows how far the user is through a fixed number of steps: a label, the current step over the total, and one segment per step. Steps are 1-based; `value` and `max` floor to whole numbers of at least 1, and `value` clamps to `max`.',
  useFor: ['progress through a multi-step flow, such as step 2 of 3', 'segments that jump back to an earlier step'],
  keywords: ['stepper', 'steps', 'progress', 'wizard', 'multi-step', 'step indicator'],
  practices: [
    { do: true, text: 'Pass localized `label`, `countLabel` and `stepLabel`. The defaults are English.' },
    {
      do: true,
      text: "Keep the current step in the flow's machine and pass it as `value`. See Multi-step flows (`mosaic guides inspect controllers`).",
    },
  ],
  parts: {
    Stepper: {
      description:
        'Renders a `div` with the text (`cl-stepper-text`, holding `cl-stepper-label` and `cl-stepper-count`) and the segments (`cl-stepper-segments`). Each segment is a `cl-stepper-segment` with `data-state` of `complete`, `current` or `upcoming`. Carries `data-value` and `data-max`.',
      slot: 'cl-stepper',
      props: {
        value: { type: 'number', doc: 'The current step, from 1.' },
        max: { type: 'number', doc: 'The number of steps.' },
        onValueChange: {
          type: '(value: number) => void',
          doc: "Makes each segment a button that calls this with its step. The current one gets `aria-current='step'`. Without it the segments are `aria-hidden`.",
        },
        label: { type: 'string', doc: 'Text before the count.', default: "'Step'" },
        countLabel: {
          type: 'string',
          doc: 'The count, with `{step}` and `{total}` filled in.',
          default: "'{step} of {total}'",
        },
        stepLabel: {
          type: 'string',
          doc: "Each segment button's accessible name, with `{step}` filled in.",
          default: "'Step {step}'",
        },
      },
    },
  },
  examples: [
    {
      title: 'Read-only',
      code: `
<Stepper value={1} max={3} />
`,
    },
    {
      title: 'Navigable',
      code: `
<Stepper value={step} max={3} onValueChange={setStep} />
`,
    },
  ],
  related: ['Flow'],
} satisfies ComponentDoc<{ Stepper: StepperProps }>;
