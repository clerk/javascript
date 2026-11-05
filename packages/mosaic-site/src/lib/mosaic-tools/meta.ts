export type ToolMeta = {
  slug: string;
  title: string;
  description: string;
  tag: string;
};
export const TOOL_META: ToolMeta[] = [
  {
    slug: 'brand',
    title: 'Brand overview',
    description:
      'The logo, colour, type, concept, voice and motion of Mosaic Components on one page, with a construction diagram.',
    tag: 'Guide',
  },
  {
    slug: 'hero-graphite-subtle',
    title: 'Hero · subtle mosaic',
    description:
      'A quiet take on the graphite hero: near-white tiles in light mode, near-black in dark mode, with a side panel to tune it.',
    tag: 'Example',
  },
  {
    slug: 'browser-frame',
    title: 'Browser frame',
    description: 'A minimal browser outline around any Mosaic component. Pick the component, address and zoom.',
    tag: 'Example',
  },
  {
    slug: 'hero-cell-trail',
    title: 'Hero · light grid',
    description: 'A hero on a light grid with a barely-there cell trail. A full-page example of the cell trail tool.',
    tag: 'Example',
  },
  {
    slug: 'pixel-resolve',
    title: 'Pixel resolve',
    description: 'Loose tiles shuffle around, then snap into place to spell the word or draw the Mosaic mark.',
    tag: 'Text',
  },
  {
    slug: 'pixel-loader',
    title: 'Pixel loader',
    description: 'A small, quiet loader: a grid of tiles in near-matching greys that swap places one pair at a time.',
    tag: 'Loader',
  },
  {
    slug: 'logo-shuffle',
    title: 'Logo shuffle',
    description:
      "The Mosaic mark reshuffles: its blocks and legs slide into each other's places, then settle back into the logo. The same effect as the hover in the nav.",
    tag: 'Logo',
  },
  {
    slug: 'mosaic-cube',
    title: 'Mosaic cube',
    description:
      'A 5×5×5 cube with the Mosaic mark on its front face. It twists itself apart, then turns back until the full logo is revealed.',
    tag: '3D · Logo',
  },
  {
    slug: 'drifting-squares',
    title: 'Drifting squares',
    description: 'Dashed squares that drift and tilt around a headline, then snap into an aligned mosaic.',
    tag: 'Background',
  },
  {
    slug: 'grid-ripple',
    title: 'Grid ripple',
    description:
      'Move or click and ripples travel through the grid as rings of lit cells that spread, fade and overlap.',
    tag: 'Background',
  },
];
export const getToolMeta = (slug: string) => TOOL_META.find(tool => tool.slug === slug);
