import type { ComponentDoc } from '../../docs-schema';

export default {
  name: 'ScrollArea',
  description:
    'StyleX styles for a scroll surface, spread onto an element you already render. There is no component. The viewport fades its edges while there is more to scroll, styles a thin scrollbar under a fine pointer, and contains overscroll. `scrollAreaVars` exposes the per-element `--cl-scroll-area-progress-start` and `-end` values, which are read, never set.',
  useFor: [
    'a scrolling list, panel body or popup with faded edges',
    'a wide table that scrolls sideways on a narrow screen',
    'a scrollable region that should not shift when it starts to overflow',
  ],
  keywords: ['scroll area', 'scroll', 'overflow', 'scrollbar', 'fade', 'scroll shadow'],
  practices: [
    { do: true, text: 'Spread the styles on the element that already scrolls, so it keeps its own slot class.' },
    {
      do: true,
      text: "Pass `scrollAreaViewport('stable')` when the content changes height in place, such as a filtered or paginated list, so rows do not shift sideways.",
    },
    { do: true, text: 'Tune the fade with the `--cl-scroll-fade-*` tokens, not the `--cl-scroll-area-*` vars.' },
    { do: false, text: 'Wrap content in an extra `div` just to scroll it. Put the styles on the existing element.' },
  ],
  parts: {
    scrollAreaViewport: {
      description:
        "A function, `scrollAreaViewport(gutter?, axis?)`, returning the scroller's styles. `gutter` is `auto` (default) or `stable`, to reserve the scrollbar space either way. `axis` is `block` (default) to scroll vertically, or `inline` to scroll horizontally; the other axis is clipped.",
    },
    scrollAreaRoot: {
      description:
        'Styles for a positioned flex-column ancestor. Only needed when something must anchor against the scroll box.',
    },
  },
  examples: [
    {
      title: 'A scrolling group',
      code: `
<div {...stylex.props(scrollAreaRoot)}>
  <Item.Group xstyle={scrollAreaViewport()}>{rows}</Item.Group>
</div>
`,
    },
    {
      title: 'A wide table',
      code: `
<div {...stylex.props(scrollAreaViewport('auto', 'inline'))}>{table}</div>
`,
    },
  ],
} satisfies ComponentDoc<{ scrollAreaViewport: object; scrollAreaRoot: object }>;
