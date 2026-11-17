import type { HookDoc } from '../docs-schema';
import type { useInView } from './use-in-view';

export default {
  name: 'useInView',
  description:
    'Tracks whether an element intersects its root with an `IntersectionObserver`. Attach the returned `ref` to the element.',
  useFor: [
    'loading the next page when the end of a list scrolls into view',
    'reacting when an element becomes visible',
  ],
  keywords: ['intersection observer', 'infinite scroll', 'visible', 'viewport', 'lazy load'],
  practices: [
    {
      do: false,
      text: 'Rely on `triggerOnce`. The type accepts it, but the hook does not read it and keeps observing.',
    },
  ],
  options: {
    root: {
      type: 'Element | Document | null',
      doc: 'The element used as the viewport. The browser viewport when unset.',
    },
    rootMargin: { type: 'string', doc: 'Grows or shrinks the root box before computing intersections.' },
    threshold: {
      type: 'number | number[]',
      doc: 'Ratio or ratios of visibility the element must reach to count as in view. Read when the ref attaches.',
      default: '0',
    },
    onChange: {
      type: '(inView: boolean, entry: IntersectionObserverEntry) => void',
      doc: 'Called with `inView` and the entry on every observer callback.',
    },
  },
  returns: {
    inView: {
      type: 'boolean',
      doc: 'Whether the element last reported as intersecting at or above a threshold.',
      default: 'false',
    },
    ref: {
      type: '(element: HTMLElement | null) => void',
      doc: 'Callback ref to attach to the observed element. Disconnects when the element detaches.',
    },
  },
  examples: [
    {
      title: 'Load more at the end of a list',
      code: `
const { ref } = useInView({
  threshold: 0,
  onChange: inView => {
    if (inView) void fetchNext();
  },
});

<div ref={ref} />
`,
    },
  ],
} satisfies HookDoc<Parameters<typeof useInView>[0], ReturnType<typeof useInView>>;
