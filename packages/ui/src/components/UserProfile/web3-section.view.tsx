import type { ReactNode } from 'react';

import { ProviderIcon } from '@/ui/common';
import { Badge, Box, Flex, localizationKeys, Text } from '@/ui/customizables';
import { Action } from '@/ui/elements/Action';
import { Card } from '@/ui/elements/Card';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import type { useWeb3SectionController, useWeb3WalletMenuController } from './web3-section.controller';
import type { Web3WalletRow } from './web3-section.model';

export const Web3SectionView = ({
  controller,
  items,
  addMenu,
}: {
  controller: ReturnType<typeof useWeb3SectionController>;
  items: ReactNode;
  addMenu: ReactNode;
}) => (
  <ProfileSection.Root
    title={localizationKeys('userProfile.start.web3WalletsSection.title')}
    centered={false}
    id='web3Wallets'
  >
    <Card.Alert>{controller.error}</Card.Alert>
    <Action.Root
      value={controller.actionValue}
      onChange={controller.setActionValue}
    >
      <ProfileSection.ItemList id='web3Wallets'>{items}</ProfileSection.ItemList>
      {addMenu}
    </Action.Root>
  </ProfileSection.Root>
);

export const Web3WalletRowView = ({
  row,
  menu,
  removeScreen,
}: {
  row: Web3WalletRow;
  menu: ReactNode;
  removeScreen: ReactNode;
}) => (
  <>
    <ProfileSection.Item
      id='web3Wallets'
      align='start'
    >
      <Flex sx={t => ({ alignItems: 'center', gap: t.space.$2, width: '100%' })}>
        {row.icon && (
          <ProviderIcon
            id={row.icon.id}
            iconUrl={row.icon.iconUrl}
            name={row.icon.name}
            alt={row.icon.name}
          />
        )}
        <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <Flex
            gap={2}
            justify='start'
          >
            <Text>{row.label}</Text>
            {row.isPrimary && <Badge localizationKey={localizationKeys('badge__primary')} />}
            {!row.isVerified && <Badge localizationKey={localizationKeys('badge__unverified')} />}
          </Flex>
        </Box>
      </Flex>
      {menu}
    </ProfileSection.Item>

    <Action.Open value={`remove-${row.id}`}>
      <Action.Card variant='destructive'>{removeScreen}</Action.Card>
    </Action.Open>
  </>
);

export const Web3WalletMenuView = ({ controller }: { controller: ReturnType<typeof useWeb3WalletMenuController> }) => (
  <ThreeDotsMenu actions={controller.actions} />
);
