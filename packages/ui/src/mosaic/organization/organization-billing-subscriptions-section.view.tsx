import type { MouseEvent, ReactElement, ReactNode } from 'react';
import { Fragment } from 'react';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Text } from '../components/text';
import type { StyleRule, SxProp } from '../slot-recipe';
import type { MosaicTheme } from '../variables';

/** Visual treatment for a subscription's status badge, mapped from the resource status by the view. */
export type SubscriptionBadgeIntent = 'active' | 'upcoming' | 'pastDue' | 'freeTrial';

/** The seats sub-row for a subscription item, already reduced to display strings. */
export interface SubscriptionSeatsRow {
  /** "Seats" row label. */
  label: string;
  /** Seat-limit / included-seats copy derived from the plan; `null` when the plan has neither. */
  limitLabel: string | null;
  /** Paid-seat usage copy (quantity + per-seat fee); `null` when no paid tier is in use. */
  usageLabel: string | null;
}

/** A single subscription item, reduced to plain data the view can render without Clerk. */
export interface SubscriptionRow {
  id: string;
  /** The plan's display name. */
  planName: string;
  /** Status badge; `null` when the item shows none. */
  badge: { label: string; intent: SubscriptionBadgeIntent } | null;
  /** Caption under the plan name; `null` when hidden (default plan and not upcoming). */
  caption: string | null;
  /** Formatted recurring fee, e.g. `"$20"`. Empty string when the plan has no fee for the period. */
  fee: string;
  /** Lowercased period word ("month"/"year"); `null` when the fee is $0 (no suffix shown). */
  feePeriod: string | null;
  /** Upcoming items render on a muted background. */
  isUpcoming: boolean;
  /** Seats sub-row; `null` when the item is not seat-based. */
  seats: SubscriptionSeatsRow | null;
}

/** The next-payment overview row appended below the subscription rows. */
export interface SubscriptionOverviewRow {
  /** "Overview" label. */
  label: string;
  /** Formatted grand total for the next payment. */
  grandTotal: string;
  /** "Renews <date>" caption. */
  renewsAt: string;
}

export interface OrganizationBillingSubscriptionsSectionViewProps {
  /** Localized section heading. */
  title: string;
  /** Visually-hidden table header labels (plan / start date). */
  columnHeaders: { plan: string; startDate: string };
  /** Subscription items already reduced to a Clerk-free row model. */
  rows: SubscriptionRow[];
  /** Next-payment overview row; `null` when there is no upcoming payment. */
  overview: SubscriptionOverviewRow | null;
  /** Switch/new-plan action; `null` when no paid plans exist. */
  switchOrNewPlan: { label: string } | null;
  /** Manage-subscription action; `null` when hidden. */
  manage: { label: string } | null;
  /** Navigates to the plans screen. */
  onSwitchOrNewPlan: () => void;
  /** Opens the subscription-details drawer; the DOM event is forwarded for the drawer's portal root. */
  onManageSubscription: (event: MouseEvent<HTMLElement>) => void;
}

const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

/** Muted background applied to upcoming subscription rows and the overview row. */
const mutedRow: SxProp = t => ({ backgroundColor: t.color.muted });

const badgeIntentStyles: Record<SubscriptionBadgeIntent, (t: MosaicTheme) => StyleRule> = {
  active: t => ({ color: t.color.mutedForeground, backgroundColor: t.alpha('primary', 8) }),
  freeTrial: t => ({ color: t.color.mutedForeground, backgroundColor: t.alpha('primary', 8) }),
  upcoming: t => ({ color: t.color.primary, backgroundColor: t.alpha('primary', 12) }),
  pastDue: () => ({
    color: 'light-dark(oklch(0.52 0.15 55), oklch(0.82 0.14 75))',
    backgroundColor: 'light-dark(oklch(0.95 0.04 85), oklch(0.35 0.08 65))',
  }),
};

function StatusBadge({ label, intent }: { label: string; intent: SubscriptionBadgeIntent }): ReactElement {
  const intentSx = badgeIntentStyles[intent];
  return (
    <Box
      render={p => <span {...p} />}
      sx={t => ({
        display: 'inline-flex',
        alignItems: 'center',
        ...t.text('xs'),
        fontWeight: t.font.medium,
        paddingInline: t.spacing(1.5),
        paddingBlock: t.spacing(0.5),
        borderRadius: t.rounded.full,
        ...intentSx(t),
      })}
    >
      {label}
    </Box>
  );
}

function Cell({
  children,
  align = 'start',
  verticalAlign = 'middle',
}: {
  children?: ReactNode;
  align?: 'start' | 'end';
  verticalAlign?: 'top' | 'middle';
}): ReactElement {
  return (
    <Box
      render={p => <td {...p} />}
      sx={t => ({
        ...t.text('sm'),
        textAlign: align,
        verticalAlign,
        paddingInline: t.spacing(3),
        paddingBlock: t.spacing(3),
      })}
    >
      {children}
    </Box>
  );
}

function PlanRow({ row }: { row: SubscriptionRow }): ReactElement {
  return (
    <Box
      render={p => <tr {...p} />}
      sx={row.isUpcoming ? mutedRow : undefined}
    >
      <Cell>
        <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(1) })}>
          <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(1.5) })}>
            <Text
              size='sm'
              sx={t => ({ fontWeight: t.font.medium })}
            >
              {row.planName}
            </Text>
            {row.badge ? (
              <StatusBadge
                label={row.badge.label}
                intent={row.badge.intent}
              />
            ) : null}
          </Box>
          {row.caption ? (
            <Text
              size='xs'
              intent='mutedForeground'
            >
              {row.caption}
            </Text>
          ) : null}
        </Box>
      </Cell>
      <Cell align='end'>
        <Text size='sm'>
          {row.fee}
          {row.feePeriod ? (
            <Box
              render={p => <span {...p} />}
              sx={t => ({ color: t.color.mutedForeground })}
            >
              {` / ${row.feePeriod}`}
            </Box>
          ) : null}
        </Text>
      </Cell>
    </Box>
  );
}

function SeatsRow({
  seats,
  isUpcoming,
}: {
  seats: SubscriptionRow['seats'];
  isUpcoming: boolean;
}): ReactElement | null {
  if (!seats) {
    return null;
  }
  return (
    <Box
      render={p => <tr {...p} />}
      sx={isUpcoming ? mutedRow : undefined}
    >
      <Cell verticalAlign='top'>
        <Text size='sm'>{seats.label}</Text>
      </Cell>
      <Cell align='end'>
        <Box sx={t => ({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: t.spacing(1) })}>
          {seats.limitLabel ? <Text size='sm'>{seats.limitLabel}</Text> : null}
          {seats.usageLabel ? <Text size='sm'>{seats.usageLabel}</Text> : null}
        </Box>
      </Cell>
    </Box>
  );
}

function OverviewRowView({ overview }: { overview: SubscriptionOverviewRow }): ReactElement {
  return (
    <Box
      render={p => <tr {...p} />}
      sx={mutedRow}
    >
      <Cell verticalAlign='top'>
        <Text
          size='sm'
          sx={t => ({ fontWeight: t.font.medium })}
        >
          {overview.label}
        </Text>
      </Cell>
      <Cell align='end'>
        <Box sx={t => ({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: t.spacing(1) })}>
          <Text
            size='lg'
            sx={t => ({ fontWeight: t.font.semibold })}
          >
            {overview.grandTotal}
          </Text>
          <Text
            size='xs'
            intent='mutedForeground'
          >
            {overview.renewsAt}
          </Text>
        </Box>
      </Cell>
    </Box>
  );
}

/**
 * Renders the organization billing subscriptions section from controller-derived props: a
 * heading, a table of subscription rows (plan, optional seats, and a next-payment overview row),
 * status badges, and the switch/new-plan and manage-subscription actions. Rendering only — it
 * receives every localized string and callback and never touches Clerk. The table is omitted
 * entirely when there are no subscription items, matching the legacy `SubscriptionsList`.
 */
export function OrganizationBillingSubscriptionsSectionView({
  title,
  columnHeaders,
  rows,
  overview,
  switchOrNewPlan,
  manage,
  onSwitchOrNewPlan,
  onManageSubscription,
}: OrganizationBillingSubscriptionsSectionViewProps): ReactElement {
  return (
    <Box sx={{ width: '100%', containerType: 'inline-size' }}>
      <Box
        render={p => <h2 {...p} />}
        sx={t => ({ ...t.text('sm'), fontWeight: t.font.semibold, marginBlockEnd: t.spacing(4) })}
      >
        {title}
      </Box>

      {rows.length > 0 ? (
        <Box
          render={p => <table {...p} />}
          sx={{ width: '100%', borderCollapse: 'collapse', overflow: 'hidden' }}
        >
          <Box
            render={p => <thead {...p} />}
            sx={visuallyHidden}
          >
            <Box render={p => <tr {...p} />}>
              <Box render={p => <th {...p} />}>{columnHeaders.plan}</Box>
              <Box render={p => <th {...p} />}>{columnHeaders.startDate}</Box>
            </Box>
          </Box>
          <Box render={p => <tbody {...p} />}>
            {rows.map(row => (
              <Fragment key={row.id}>
                <PlanRow row={row} />
                <SeatsRow
                  seats={row.seats}
                  isUpcoming={row.isUpcoming}
                />
              </Fragment>
            ))}
            {overview ? <OverviewRowView overview={overview} /> : null}
          </Box>
        </Box>
      ) : null}

      <Box
        sx={t => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          marginBlockStart: t.spacing(2),
        })}
      >
        {switchOrNewPlan ? (
          <Button
            variant='ghost'
            size='sm'
            onClick={onSwitchOrNewPlan}
            sx={{ justifyContent: 'flex-start' }}
          >
            {switchOrNewPlan.label}
          </Button>
        ) : null}
        {manage ? (
          <Button
            variant='ghost'
            size='sm'
            onClick={onManageSubscription}
            sx={{ justifyContent: 'flex-start' }}
          >
            {manage.label}
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}
