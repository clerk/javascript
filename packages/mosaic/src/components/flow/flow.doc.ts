import type { ComponentDoc } from '../../docs-schema';
import type { FlowRootProps, FlowStepProps } from './flow';

export default {
  name: 'Flow',
  description:
    'One screen replacing another on the same card or dialog. The surface stays put, its height animates, and the outgoing step stays mounted, inert, until its exit finishes. Wraps the headless `Flow` primitive.',
  useFor: [
    'one screen replacing another on the same card or dialog',
    'a multi-step flow on one surface',
    'animating between a list and a create screen',
  ],
  keywords: ['flow', 'steps', 'wizard', 'multi-step', 'screen transition', 'stepper'],
  practices: [
    {
      do: true,
      text: 'Mark the element a step should focus when it enters with `useFlowAutoFocus`, exported from this unit.',
    },
    {
      do: true,
      text: 'Keep the surface outside the flow and render one `Flow.Root` per surface. The rules are in the Views guide (`mosaic guides inspect views`).',
    },
    {
      do: false,
      text: 'Swap screens with a conditional or an early return. The new screen pops in instead of animating.',
    },
  ],
  parts: {
    'Flow.Root': {
      description:
        'The viewport. Measures the active step into `--cl-flow-step-height` and carries `data-value`, `data-initial`, `data-transitioning` and `data-height-change`.',
      slot: 'cl-flow-root',
      props: {
        value: { type: 'string', doc: 'The active state. Selects the step whose `ids` include it.' },
        direction: { type: 'FlowDirection', doc: '`1` forward or `-1` back, for the step transition.', default: '1' },
        state: {
          type: 'State',
          doc: 'Passed to `children`, so an exiting step keeps the content of its last active render.',
        },
        children: { type: '(state: State) => React.ReactNode', doc: 'Renders the steps from `state`.' },
      },
    },
    'Flow.Step': {
      description:
        'One screen. Renders while active or exiting, with `data-open`, `data-closed`, `data-starting-style`, `data-ending-style` and `data-step` (its first id).',
      slot: 'cl-flow-step',
      props: {
        ids: {
          type: 'readonly string[]',
          doc: 'The states this step renders for. Moving between them does not start a transition.',
        },
      },
    },
  },
  examples: [
    {
      title: 'A list and a create screen',
      code: `
<Flow.Root value={step} direction={step === 'list' ? -1 : 1} state={props}>
  {current => (
    <>
      <Flow.Step ids={['list']}>
        <ListStep {...current} />
      </Flow.Step>
      <Flow.Step ids={['create']}>
        <CreateStep {...current} />
      </Flow.Step>
    </>
  )}
</Flow.Root>
`,
    },
  ],
  related: ['Card', 'Dialog', 'useFlowAutoFocus'],
} satisfies ComponentDoc<{ 'Flow.Root': FlowRootProps<unknown>; 'Flow.Step': FlowStepProps }>;
