import type { ComponentDoc } from '../../docs-schema';
import type { PortalProps, PortalProviderProps } from './portal';

export default {
  name: 'Portal',
  description:
    'Renders children into another element, `document.body` by default. `PortalProvider` sets that element for every Mosaic overlay below it, and `useGetPortalContainer` reads it back.',
  useFor: [
    'rendering an overlay outside its parent’s clipping or stacking context',
    'portalling every Mosaic overlay into one container instead of `document.body`',
    'a modal host that must hold its own popovers and menus',
  ],
  keywords: ['portal', 'container', 'overlay', 'layer', 'document.body'],
  practices: [
    {
      do: true,
      text: 'Set the container once with `PortalProvider`, instead of passing `root` to each overlay’s portal.',
    },
    {
      do: true,
      text: 'Call `useGetPortalContainer` when code that mounts its own UI needs the container. It returns `undefined` without a provider.',
    },
  ],
  parts: {
    Portal: {
      description:
        'Portals its children through Floating UI’s `FloatingPortal`. Inside another `Portal`, it ignores the provider’s container.',
      props: {
        root: {
          type: 'PortalContainer',
          doc: 'The element or ref to portal into.',
          default: 'the `PortalProvider` container, else `document.body`',
        },
      },
    },
    PortalProvider: {
      description: 'Sets where Mosaic overlays below it portal to. Overlays wait until the container exists.',
      props: { container: { type: 'PortalContainer', doc: 'The element or ref to portal into.' } },
    },
  },
  examples: [
    {
      title: 'Overlays in a host element',
      code: `
const host = useRef<HTMLDivElement>(null);

<div ref={host} />
<PortalProvider container={host}>{children}</PortalProvider>
`,
    },
  ],
  related: ['Popover', 'Menu', 'Tooltip', 'Toast'],
} satisfies ComponentDoc<{
  Portal: PortalProps;
  PortalProvider: PortalProviderProps;
}>;
