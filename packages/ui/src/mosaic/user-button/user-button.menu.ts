import type { ReactNode } from 'react';

/**
 * A built-in action the foot of the popup lists as a row of its own, named by the id `menuItemOrder`
 * knows it by. The surface's other actions live in its header or behind a `⋯`, where there is no
 * list for an order to run in.
 */
export type UserButtonMenuItemId = 'createOrganization' | 'addAccount' | 'signOutAll';

interface UserButtonMenuItemBase {
  /** Identifies the row, for ordering. */
  id: string;
  /** Names the row. */
  label: string;
  icon?: ReactNode;
}

/** An action of your own at the foot of the popup. */
export interface UserButtonMenuAction extends UserButtonMenuItemBase {
  onClick: () => void;
  href?: never;
}

/** A row at the foot of the popup that leaves for somewhere else. */
export interface UserButtonMenuLink extends UserButtonMenuItemBase {
  /** Where the row goes. */
  href: string;
  onClick?: never;
}

export type UserButtonMenuItem = UserButtonMenuAction | UserButtonMenuLink;

/**
 * The foot's rows, in the order it shows them.
 *
 * Custom rows lead by default, the way the existing UserButton lists them above "Add account".
 * `order` names rows by id to place them anywhere instead, and whatever it leaves out keeps its
 * default place behind what it named. An id matching no row is dropped rather than held open: only
 * some of the built-in actions are rows at all, and which of those a surface carries depends on its
 * mode, so naming one it has not got is ordinary rather than a mistake.
 */
export function arrangeMenuRows<T extends { id: string }>(
  order: readonly string[] | undefined,
  custom: readonly T[],
  builtIn: readonly T[],
): T[] {
  // A custom row taking a built-in's id shadows it, rather than both answering to the same id.
  const rows = [...custom, ...builtIn].filter((row, index, all) => all.findIndex(r => r.id === row.id) === index);
  if (!order?.length) {
    return rows;
  }

  const named = [...new Set(order)].flatMap(id => rows.filter(row => row.id === id));
  return [...named, ...rows.filter(row => !named.includes(row))];
}
