import type { ReactElement } from 'react';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Text } from '../components/text';

export interface OrganizationBillingAccountCreditsSectionViewProps {
  /** Section heading. */
  title: string;
  /** Formatted credit balance, e.g. `"$50.00"`. */
  balanceLabel: string;
  /** View-credit-history action. */
  viewHistory: { label: string };
  /** Navigates to the credit-history screen. */
  onViewHistory: () => void;
}

/**
 * Renders the organization billing account-credits section from controller-derived props: a
 * heading, the current credit balance, and a view-credit-history action. Rendering only — it
 * receives every string and callback and never touches Clerk.
 */
export function OrganizationBillingAccountCreditsSectionView({
  title,
  balanceLabel,
  viewHistory,
  onViewHistory,
}: OrganizationBillingAccountCreditsSectionViewProps): ReactElement {
  return (
    <Box sx={{ width: '100%' }}>
      <Box
        render={p => <h2 {...p} />}
        sx={t => ({ ...t.text('sm'), fontWeight: t.font.semibold, marginBlockEnd: t.spacing(4) })}
      >
        {title}
      </Box>

      <Text
        size='sm'
        sx={t => ({ fontWeight: t.font.medium })}
      >
        {balanceLabel}
      </Text>

      <Box
        sx={t => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          marginBlockStart: t.spacing(2),
        })}
      >
        <Button
          variant='ghost'
          size='sm'
          onClick={onViewHistory}
          sx={{ justifyContent: 'flex-start' }}
        >
          {viewHistory.label}
        </Button>
      </Box>
    </Box>
  );
}
