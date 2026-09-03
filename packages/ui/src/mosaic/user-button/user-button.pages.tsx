import {
  disabledUserAPIKeysFeature,
  disabledUserBillingFeature,
} from '@clerk/shared/internal/clerk-js/componentGuards';
import { useClerk } from '@clerk/shared/react';
import type { CustomPage } from '@clerk/shared/types';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

import { useMosaicEnvironment } from '../hooks/useMosaicEnvironment';
import type {
  CustomProfileItem,
  CustomProfileLink,
  CustomProfilePage,
  UserProfilePageId,
} from '../user-profile/user-profile.types';
import { applyOrder } from './user-button.utils';

export type { CustomProfileItem, CustomProfileLink, CustomProfilePage, UserProfilePageId };

/**
 * The UserProfile's own pages, in the order it lists them, minus the ones this instance has turned
 * off.
 *
 * Ordering a custom page after a built-in one means naming every built-in that follows it, so the
 * list has to match what the profile will actually show. It mirrors clerk-js rather than being read
 * from it: the profile is not mounted yet at the point this is needed, and it decides its own pages
 * from the same environment behind the same guards.
 */
export function useUserProfilePages(): UserProfilePageId[] {
  const clerk = useClerk();
  const environment = useMosaicEnvironment();

  const pages: UserProfilePageId[] = ['account', 'security'];
  if (!disabledUserBillingFeature(clerk, environment)) {
    pages.push('billing');
  }
  if (!disabledUserAPIKeysFeature(clerk, environment)) {
    pages.push('apiKeys');
  }
  return pages;
}

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

const isLink = (item: CustomProfileItem): item is CustomProfileLink => item.href !== undefined;

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

  const byId = new Map((items ?? []).map(item => [item.path, item]));
  // clerk-js puts every built-in page it was *not* asked to move ahead of everything it was, so a
  // built-in left out of the order has to be sent anyway to keep it behind the pages that were named.
  // Without an order there is nothing to hold in place, so only the custom pages go out.
  const ids = order?.length ? applyOrder(order, [...builtInPages, ...byId.keys()], id => id) : [...byId.keys()];

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
    const content = isLink(item) ? undefined : bind(`content:${id}`);

    return {
      label: item.label,
      // A page is routed to by its path; a link is followed to wherever it points.
      url: isLink(item) ? item.href : item.path,
      mountIcon: icon.mount,
      unmountIcon: icon.unmount,
      ...(content && { mount: content.mount, unmount: content.unmount }),
    };
  });

  const portals = (items ?? []).flatMap(item => [
    portalInto(containers, `icon:${item.path}`, item.icon),
    ...(isLink(item) ? [] : [portalInto(containers, `content:${item.path}`, item.content)]),
  ]);

  return { customPages, portals };
}
