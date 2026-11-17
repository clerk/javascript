import type { ComponentDoc } from '../../docs-schema';
import type { PanelRootProps, PanelSectionsProps, PanelTitleProps } from './panel';

export default {
  name: 'Panel',
  description:
    'A page of content with a title and its sections. `Panel.Sections` sit one heading level below `Panel.Title`. `usePanelTitle` returns a getter for the title element, to move focus to it.',
  useFor: [
    'a page of settings with a title and sections',
    'a page inside a `Profile`',
    'focusing the page title after navigation, with `usePanelTitle`',
  ],
  keywords: ['panel', 'page', 'page title', 'sections', 'settings page'],
  practices: [
    { do: true, text: 'Put each `Section` inside `Panel.Sections`, so its heading is one level below the title.' },
    {
      do: false,
      text: 'Expect `Panel.Title` to render inside a `Profile.ContentPanel`. The profile renders the page title there, and the title ref reaches that heading instead.',
    },
  ],
  parts: {
    'Panel.Root': {
      description: 'A `div` that holds the title ref for `usePanelTitle`.',
      slot: 'cl-panel',
    },
    'Panel.Title': {
      description: 'A focusable `div` (`tabIndex={-1}`) around a `2xl` `Heading` at the current level.',
      slot: 'cl-panel-title',
    },
    'Panel.Sections': {
      description: 'A `div` that sets the heading level one deeper for its children.',
      slot: 'cl-panel-sections',
    },
  },
  examples: [
    {
      title: 'A page',
      code: `
<Panel.Root>
  <Panel.Title>Account</Panel.Title>
  <Panel.Sections>
    <Section.Root>…</Section.Root>
  </Panel.Sections>
</Panel.Root>
`,
    },
  ],
  related: ['Profile', 'Section', 'Heading'],
} satisfies ComponentDoc<{
  'Panel.Root': PanelRootProps;
  'Panel.Title': PanelTitleProps;
  'Panel.Sections': PanelSectionsProps;
}>;
