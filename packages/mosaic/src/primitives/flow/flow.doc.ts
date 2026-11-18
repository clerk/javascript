import type { ComponentDoc } from '../../docs-schema';
import type { FlowRootProps } from './flow-root';
import type { FlowStepProps } from './flow-step';

export default {
  name: 'Flow',
  description:
    'Headless, unstyled viewport that shows one step of a multi-step flow at a time, keeping the outgoing step mounted, inert and `aria-hidden` until its exit transition ends. Measures the active step into `--cl-flow-step-height` on the root. `useFlowAutoFocus` marks what a step focuses when it enters, and `useFlowStepActive` is `false` inside an exiting step.',
  useFor: [
    'the base for a styled component that swaps screens on one surface',
    'focusing a field when a step of a multi-step flow enters',
    'knowing whether content sits in an exiting step',
  ],
  keywords: ['flow', 'steps', 'wizard', 'multi-step', 'transition', 'screen swap', 'autofocus'],
  practices: [
    {
      do: false,
      text: 'Use the primitive in a feature. Use the styled `Flow` from `src/components/flow` instead, as the Views guide says (`mosaic guides inspect views`).',
    },
    {
      do: true,
      text: 'List every controller state a screen covers in one `Flow.Step` `ids`, such as its pending and error states, so moving between them does not transition.',
    },
    { do: true, text: 'Attach `useFlowAutoFocus()` to the field a step should focus when it enters.' },
    {
      do: true,
      text: 'Style `Flow.Root` with `overflow: clip`, not `hidden`, so focusing a sliding step cannot scroll it.',
    },
    {
      do: true,
      text: 'Transition the root height only under `data-transitioning`, so a resize inside the active step is not animated twice.',
    },
  ],
  parts: {
    'Flow.Root': {
      description:
        'Renders a `div`, or the `render` element. Carries `data-initial` through the first measured frame, `data-transitioning` from a step change until its own `height` transition ends, and `data-height-change` of `grow` or `shrink`.',
      props: {
        value: { type: 'string', doc: 'The active controller state. The step whose `ids` include it is shown.' },
        direction: {
          type: 'FlowDirection',
          doc: '`1` forward or `-1` back. Each step exposes it as `--cl-flow-transition-direction`.',
          default: '1',
        },
      },
    },
    'Flow.Step': {
      description:
        'Renders while active or exiting, with `data-open`, `data-closed`, `data-starting-style` and `data-ending-style`. An exiting step keeps the children of its last active render. The first active step gets no `data-starting-style`.',
      props: {
        ids: { type: 'readonly string[]', doc: 'The controller states this step shows for.' },
      },
    },
  },
  examples: [
    {
      title: 'Two steps',
      code: `
<Flow.Root value={status} direction={direction}>
  <Flow.Step ids={['password', 'password-pending']}>
    <PasswordView />
  </Flow.Step>
  <Flow.Step ids={['code', 'code-pending']}>
    <CodeView />
  </Flow.Step>
</Flow.Root>
`,
    },
  ],
} satisfies ComponentDoc<{ 'Flow.Root': FlowRootProps; 'Flow.Step': FlowStepProps }>;
