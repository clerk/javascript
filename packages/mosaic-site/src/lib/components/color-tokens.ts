export type ColorToken = { name: string; use: string };
export type ColorTokenGroup = { title: string; lead: string; tokens: ColorToken[] };
export const COLOR_TOKEN_GROUPS: ColorTokenGroup[] = [
  {
    title: 'Layers',
    lead: 'Three solid tiers carry the depth. Page is the base shell, surface is everything raised on it, and surface-subtle is the faded step inside a surface.',
    tokens: [
      { name: '--cl-color-page', use: 'The shell of a settings surface such as the profile. The darkest layer.' },
      { name: '--cl-color-surface', use: 'Cards, sections, menus, popovers, dialogs and controls.' },
      { name: '--cl-color-surface-subtle', use: 'Footers, tiles and striped rows on a surface.' },
    ],
  },
  {
    title: 'Text',
    lead: 'There is no gray scale. Each step is neutral mixed into surface, so a warm neutral retints all of them.',
    tokens: [
      { name: '--cl-color-foreground', use: 'Primary text and icons.' },
      { name: '--cl-color-foreground-secondary', use: 'Descriptions, captions and secondary icons.' },
      { name: '--cl-color-foreground-disabled', use: 'Text on disabled controls.' },
    ],
  },
  {
    title: 'Borders',
    lead: 'Borders are washes of neutral, so they keep the same step over any layer.',
    tokens: [
      { name: '--cl-color-border', use: 'Controls: inputs, outline buttons, selects.' },
      { name: '--cl-color-border-subtle', use: 'Containers and dividers.' },
    ],
  },
  {
    title: 'Brand',
    lead: 'The accent. Filled buttons, selected states and the primary badge all read from this family.',
    tokens: [
      { name: '--cl-color-brand', use: 'Filled primary buttons, links and selected indicators.' },
      { name: '--cl-color-brand-foreground', use: 'Text and icons on a solid brand fill.' },
      { name: '--cl-color-brand-subtle', use: 'Soft tinted backgrounds, such as the primary badge.' },
      { name: '--cl-color-brand-border', use: 'Borders on tinted brand backgrounds.' },
    ],
  },
  {
    title: 'Status',
    lead: 'Negative, positive and warning share the brand shape: a seed, a foreground, a subtle wash and a border. Neutral has the same slots under its own names.',
    tokens: [
      { name: '--cl-color-negative', use: 'Destructive buttons, errors and invalid fields.' },
      { name: '--cl-color-negative-subtle', use: 'Error banners and negative badges.' },
      { name: '--cl-color-positive', use: 'Success states and confirmations.' },
      { name: '--cl-color-positive-subtle', use: 'Success banners and positive badges.' },
      { name: '--cl-color-warning', use: 'Cautions that need attention but are not errors.' },
      { name: '--cl-color-warning-subtle', use: 'Warning banners and warning badges.' },
      { name: '--cl-color-neutral-subtle', use: 'Chips such as the neutral badge.' },
    ],
  },
  {
    title: 'Controls',
    lead: 'Form fields and focus.',
    tokens: [
      { name: '--cl-color-input', use: 'The fill of a text input. Defaults to surface.' },
      { name: '--cl-color-input-placeholder', use: 'Placeholder text.' },
      { name: '--cl-color-ring', use: 'The focus ring.' },
    ],
  },
];
