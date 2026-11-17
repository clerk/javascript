import type { ComponentDoc } from '../../docs-schema';
import type { SkeletonProps } from './skeleton';

export default {
  name: 'Skeleton',
  description:
    'A placeholder for content that is still loading. Wraps the content it stands in for: text becomes a cap-height bar as wide as the text, and an element becomes a block its size, hidden underneath. `aria-hidden`.',
  useFor: [
    'a placeholder for content that is still loading',
    'a loading skeleton for a section, row or table',
    'keeping the space of a control while loading without drawing a bone',
  ],
  keywords: ['skeleton', 'loading', 'placeholder', 'bone', 'shimmer'],
  practices: [
    {
      do: true,
      text: 'Build a skeleton in its own `<feature>.skeleton.tsx` from the same components as the view. The rules are in the Skeletons guide (`mosaic guides inspect skeletons`).',
    },
    { do: true, text: 'Write placeholder strings at a typical length, one line each. Bars do not wrap.' },
    { do: true, text: 'Wrap row actions with `visible={false}` so the row keeps its height without a bone.' },
    { do: false, text: 'Leave a skeleton up when the fetch returns nothing. Render `EmptyState` instead.' },
    { do: false, text: 'Add skeleton code to a component or view. Wrap content in `Skeleton` from the skeleton file.' },
  ],
  parts: {
    Skeleton: {
      description:
        'Renders a `span` around its children and forwards its ref. Carries `data-shape` for element children, and `data-text` and `data-visible`.',
      slot: 'cl-skeleton',
      props: {
        show: { type: 'boolean', doc: 'When `false`, renders the children as they are.', default: 'true' },
        visible: { type: 'boolean', doc: 'When `false`, keeps the space but draws no bone.', default: 'true' },
        shape: {
          type: 'SkeletonShape',
          doc: '`rounded` for media and buttons, `pill` for avatars and round controls, `square` for image tiles. Ignored for text.',
          default: "'rounded'",
        },
        width: { type: 'number | string', doc: 'Fixed width, as px or a CSS length. For a skeleton with no children.' },
        height: {
          type: 'number | string',
          doc: 'Fixed height, as px or a CSS length. For a skeleton with no children.',
        },
      },
    },
  },
  examples: [
    {
      title: 'A text bar',
      code: `
<Section.Label>
  <Skeleton>{device.name}</Skeleton>
</Section.Label>
`,
    },
    {
      title: 'Content that stays mounted',
      code: `
<Skeleton show={loading}>{title}</Skeleton>
`,
    },
  ],
  related: ['EmptyState', 'useSpinDelay', 'VisuallyHidden'],
} satisfies ComponentDoc<{ Skeleton: SkeletonProps }>;
