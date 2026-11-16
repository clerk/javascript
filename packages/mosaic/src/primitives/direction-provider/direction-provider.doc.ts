import type { ComponentDoc } from '../../docs-schema';
import type { DirectionProviderProps } from './direction-provider';

export default {
  name: 'DirectionProvider',
  description:
    'Sets the reading direction that arrow-key navigation follows below it. `useDirection` reads it, falling back to `ltr` with no provider, and `readingDirectionKeys` maps it to the previous and next arrow keys.',
  useFor: ['right-to-left arrow-key navigation', 'reading the text direction in a primitive that handles arrow keys'],
  keywords: ['direction', 'rtl', 'ltr', 'dir', 'arrow keys', 'bidi'],
  practices: [
    { do: true, text: "Set `MosaicProvider`'s `direction` to match the page's `dir`. It renders this provider." },
    {
      do: true,
      text: 'In a primitive, get the arrow keys from `readingDirectionKeys(useDirection())` instead of hard-coding `ArrowLeft` and `ArrowRight`.',
    },
    { do: false, text: 'Expect it to set `dir` on the DOM. It only steers keyboard navigation.' },
  ],
  parts: {
    DirectionProvider: {
      description: 'Provides the direction to its children. Renders no element.',
      props: {
        direction: { type: 'TextDirection', doc: '`ltr` or `rtl`.', default: "'ltr'" },
      },
    },
  },
  related: ['MosaicProvider'],
} satisfies ComponentDoc<{ DirectionProvider: DirectionProviderProps }>;
