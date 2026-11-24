import type { ComponentDoc } from '../../docs-schema';
import type { PanelRootProps, PanelSectionsProps, PanelTitleProps } from './panel';

export default {
  name: 'Panel',
  description:
    'A page of content with a title and its sections. `Panel.Sections` sit one heading level below `Panel.Title`. `Panel.usePanelTitle` returns a getter for the title element, to move focus to it.',
  useFor: [
    'a page of settings with a title and sections',
    'a page inside a `Profile`',
    'focusing the page title after navigation, with `Panel.usePanelTitle`',
  ],
  keywords: ['panel', 'page', 'page title', 'sections', 'settings page'],
  practices: [
    { do: true, text: 'Put each `Section` inside `Panel.Sections`, so its heading is one level below the title.' },
    {
      do: false,
      text: 'Render your own heading for a `Profile.ContentPanel` page. Use `Panel.Title`: it is the page title there, and on compact layouts it opens the navigation.',
    },
  ],
  parts: {
    'Panel.Root': {
      description: 'A `div` that holds the title ref for `Panel.usePanelTitle`.',
      slot: 'cl-panel',
    },
    'Panel.Title': {
      description:
        "A focusable `div` (`tabIndex={-1}`) around a `2xl` `Heading` at the current level. In a `Profile.ContentPanel` it is the page title, and on compact layouts the navigation's trigger.",
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
  exports: {
    'Panel.usePanelTitle': { description: 'Returns a getter for the `Panel.Title` element, to move focus to it.' },
  },
} satisfies ComponentDoc<{
  'Panel.Root': PanelRootProps;
  'Panel.Title': PanelTitleProps;
  'Panel.Sections': PanelSectionsProps;
}>;
