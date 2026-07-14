import type { ReactElement, ReactNode } from 'react';

import { Box } from '../components/box';
import { Tabs } from '../components/tabs';

export interface OrganizationBillingPanelViewProps {
  /** Localized panel heading. */
  title: string;
  /** Card-level error to surface above the tabs; nothing renders when falsy. */
  error?: ReactNode;
  /** Controlled active tab value (`subscriptions` | `statements` | `payments`). */
  value: string;
  /** Called with the newly selected tab value; the wrapper syncs it to the URL `?tab=`. */
  onTabChange: (value: string) => void;
  /** Localized tab labels. */
  tabLabels: { subscriptions: string; statements: string; payments: string };
  /** The Subscriptions tab's panel content. */
  subscriptions: ReactNode;
  /** The Statements tab's panel content. */
  statements: ReactNode;
  /** The Payments tab's panel content. */
  payments: ReactNode;
}

/**
 * The organization billing panel shell: a heading, a card-error region, and a tabbed layout that
 * hosts the Subscriptions, Statements, and Payments panels. Layout only — the caller supplies each
 * tab's content via the `subscriptions`, `statements`, and `payments` slots and drives tab
 * selection through the controlled `value` / `onTabChange` pair, so this component holds no data or
 * Clerk state itself.
 */
export function OrganizationBillingPanelView({
  title,
  error,
  value,
  onTabChange,
  tabLabels,
  subscriptions,
  statements,
  payments,
}: OrganizationBillingPanelViewProps): ReactElement {
  return (
    <Box sx={{ width: '100%' }}>
      <Box
        render={p => <h2 {...p} />}
        sx={t => ({ ...t.text('lg'), fontWeight: t.font.semibold, marginBlockEnd: t.spacing(4) })}
      >
        {title}
      </Box>

      {error ? (
        <Box
          role='alert'
          sx={t => ({
            ...t.text('sm'),
            color: t.color.destructive,
            marginBlockEnd: t.spacing(4),
          })}
        >
          {error}
        </Box>
      ) : null}

      <Tabs.Root
        value={value}
        onValueChange={onTabChange}
      >
        <Tabs.List>
          <Tabs.Tab value='subscriptions'>{tabLabels.subscriptions}</Tabs.Tab>
          <Tabs.Tab value='statements'>{tabLabels.statements}</Tabs.Tab>
          <Tabs.Tab value='payments'>{tabLabels.payments}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value='subscriptions'>{subscriptions}</Tabs.Panel>
        <Tabs.Panel value='statements'>{statements}</Tabs.Panel>
        <Tabs.Panel value='payments'>{payments}</Tabs.Panel>
      </Tabs.Root>
    </Box>
  );
}
