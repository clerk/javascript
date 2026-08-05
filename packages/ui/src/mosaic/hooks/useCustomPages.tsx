import type { CustomPage } from '@clerk/shared/types';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

/** A page of your own inside the profile, reached from its navigation. */
export interface CustomProfilePage {
  /** Names the page in the profile's navigation. */
  label: string;
  /** Where the page lives, relative to the profile root. Absolute URLs are rejected. */
  path: string;
  href?: never;
  icon?: ReactNode;
  /** Rendered as the page itself. */
  content: ReactNode;
}

/** A row in the profile's navigation that leaves for somewhere else. */
export interface CustomProfileLink {
  /** Names the row in the profile's navigation. */
  label: string;
  /** Where the row goes. */
  href: string;
  path?: never;
  icon?: ReactNode;
  content?: never;
}

export type CustomProfileItem = CustomProfilePage | CustomProfileLink;

export interface CustomPagesOptions {
  /** Pages and links of the consumer's own. */
  items: CustomProfileItem[] | undefined;
  /** The order the profile's navigation should run in, by id. */
  order: readonly string[] | undefined;
  /** The profile's own pages, in the order it shows them, minus any this instance has turned off. */
  builtInPages: readonly string[];
}

export interface CustomPagesBridge {
  /** clerk-js's own custom-page form, ready to pass to `openUserProfile`. */
  customPages: CustomPage[] | undefined;
  /** Render these for as long as the profile can be open, or its pages come up blank. */
  portals: ReactNode[];
}

const isPage = (item: CustomProfileItem): item is CustomProfilePage => item.path !== undefined;

/** A page is identified by where it lives, which the profile's routing already requires be unique. */
const identify = (item: CustomProfileItem): string => (isPage(item) ? item.path : item.href);

/**
 * The ids to send, in the order the profile should show them.
 *
 * clerk-js puts every built-in page it was *not* asked to move ahead of everything it was, so a
 * built-in left out of the order has to be sent anyway to keep it behind the pages that were named.
 * Ids that match no page are dropped rather than sent: clerk-js would reject them, and does so by
 * logging them as invalid page data, which is not what a typo in this list deserves.
 */
function arrange(
  order: readonly string[],
  items: ReadonlyMap<string, CustomProfileItem>,
  builtInPages: readonly string[],
): string[] {
  const exists = (id: string) => items.has(id) || builtInPages.includes(id);
  const named = [...new Set(order)].filter(exists);
  const rest = [...builtInPages, ...items.keys()].filter(id => !named.includes(id));
  return [...named, ...rest];
}

function portalInto(containers: ReadonlyMap<string, HTMLDivElement>, id: string, node: ReactNode): ReactNode {
  const container = containers.get(id);
  return container ? createPortal(node, container, id) : null;
}

/**
 * Bridges custom pages written as React nodes into the DOM callbacks clerk-js takes.
 *
 * The profile opens in clerk-js's own React root, which cannot render a node from the host app's
 * tree. So each page is sent as a `mount`/`unmount` pair: clerk-js renders an empty `div` where the
 * page belongs and hands it over, and the host tree portals the content into it from here. The
 * portals therefore have to stay mounted in the host tree the whole time the profile is open, which
 * is why they come back out rather than being rendered here.
 *
 * This is the shape of the bridge only for as long as the profile renders outside the host tree. A
 * Mosaic profile mounted in-tree renders `content` directly, and none of this survives except the
 * props a consumer writes.
 */
export function useCustomPages({ items, order, builtInPages }: CustomPagesOptions): CustomPagesBridge {
  const [containers, setContainers] = useState<ReadonlyMap<string, HTMLDivElement>>(new Map());

  // Keyed by id rather than closing over the element, so the callbacks a profile was opened with keep
  // working: the portal re-reads its container from state on every render of the host tree.
  const bind = useCallback(
    (id: string) => ({
      mount: (el: HTMLDivElement) => setContainers(prev => new Map(prev).set(id, el)),
      unmount: () =>
        setContainers(prev => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        }),
    }),
    [],
  );

  const byId = new Map((items ?? []).map(item => [identify(item), item]));
  const ids = order?.length ? arrange(order, byId, builtInPages) : [...byId.keys()];

  if (!ids.length) {
    return { customPages: undefined, portals: [] };
  }

  const customPages = ids.map(id => {
    const item = byId.get(id);
    // A built-in page, which clerk-js moves on nothing but its id. Anything else attached to it and
    // it reads as a custom page instead.
    if (!item) {
      return { label: id };
    }

    // clerk-js decides what an item *is* from which callbacks are present, and drops one missing an
    // icon pair as invalid. So the icon callbacks go out whether or not there is an icon to put
    // through them; without them, leaving `icon` off would silently cost you the page.
    const icon = bind(`icon:${id}`);
    const content = isPage(item) ? bind(`content:${id}`) : undefined;

    return {
      label: item.label,
      url: id,
      mountIcon: icon.mount,
      unmountIcon: icon.unmount,
      ...(content && { mount: content.mount, unmount: content.unmount }),
    };
  });

  const portals = (items ?? []).flatMap(item => [
    portalInto(containers, `icon:${identify(item)}`, item.icon),
    ...(isPage(item) ? [portalInto(containers, `content:${identify(item)}`, item.content)] : []),
  ]);

  return { customPages, portals };
}
