import type { ReactNode } from 'react';

import { Box, descriptors, Flex, Spinner, Text } from '@/customizables';
import { Action } from '@/ui/elements/Action';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import type { DomainListData, DomainMenuData, DomainRow } from './domain-list.types';
import { EnrollmentBadgeRow } from './EnrollmentBadge';
import { RemoveDomainScreen } from './RemoveDomainScreen';
import { VerifiedDomainScreen } from './VerifiedDomainScreen';
import { VerifyDomainScreen } from './VerifyDomainScreen';

export const DomainListView = ({
  controller,
  fallback,
  children,
}: {
  controller: DomainListData;
  fallback?: ReactNode;
  children: ReactNode;
}) => (
  <ProfileSection.ItemList id='organizationDomains'>
    {controller.rows.length === 0 && !controller.isLoading && fallback}
    {children}

    <Box
      ref={controller.sentinelRef}
      sx={{ visibility: 'hidden' }}
    />

    {controller.showSpinner && (
      <Box
        sx={[
          t => ({
            width: '100%',
            height: t.space.$8,
            position: 'relative',
          }),
        ]}
      >
        <Box
          sx={{
            display: 'flex',
            margin: 'auto',
            position: 'absolute',
            // eslint-disable-next-line custom-rules/no-physical-css-properties -- Centering with transform: translateX(-50%)
            left: '50%',
            top: '50%',
            transform: 'translateY(-50%) translateX(-50%)',
          }}
        >
          <Spinner
            size='sm'
            colorScheme='primary'
            elementDescriptor={descriptors.spinner}
          />
        </Box>
      </Box>
    )}
  </ProfileSection.ItemList>
);

export const DomainListRowView = ({
  row,
  menu,
  canManageDomains,
}: {
  row: DomainRow;
  menu: DomainMenuData;
  canManageDomains: boolean;
}) => (
  <>
    <ProfileSection.Item
      id='organizationDomains'
      hoverable
    >
      <Flex sx={t => ({ gap: t.space.$1 })}>
        <Text>{row.name}</Text>
        <EnrollmentBadgeRow
          isVerified={row.isVerified}
          enrollmentMode={row.enrollmentMode}
        />
      </Flex>

      {canManageDomains && <ThreeDotsMenu actions={menu.actions} />}
    </ProfileSection.Item>

    <Action.Open value='remove'>
      <Action.Card variant='destructive'>
        <RemoveDomainScreen domainId={row.id} />
      </Action.Card>
    </Action.Open>

    <Action.Open value='verify'>
      <Action.Card>
        <VerifyDomainScreen domainId={row.id} />
      </Action.Card>
    </Action.Open>

    <Action.Open value='manage'>
      <Action.Card>
        <VerifiedDomainScreen domainId={row.id} />
      </Action.Card>
    </Action.Open>
  </>
);
