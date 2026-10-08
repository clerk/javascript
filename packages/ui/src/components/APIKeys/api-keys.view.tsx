import type { ComponentType } from 'react';

import { Box, Button, Col, descriptors, Flex, localizationKeys } from '@/ui/customizables';
import { Action } from '@/ui/elements/Action';
import { Pagination } from '@/ui/elements/Pagination';
import { SearchInput } from '@/ui/elements/SearchInput';
import { mqu } from '@/ui/styledSystem';

import type { APIKeysPageData, CopyAPIKeyModalProps, RevokeAPIKeyConfirmationModalProps } from './api-keys.types';
import { APIKeysTableView } from './api-keys-table.view';
import { CreateAPIKeyForm } from './CreateAPIKeyForm';

export const APIKeysPageView = ({
  controller,
  CopyModal,
  RevokeModal,
}: {
  controller: APIKeysPageData;
  CopyModal: ComponentType<CopyAPIKeyModalProps>;
  RevokeModal: ComponentType<RevokeAPIKeyConfirmationModalProps>;
}) => (
  <Col
    gap={4}
    sx={{ width: '100%' }}
    elementDescriptor={descriptors.apiKeys}
  >
    <Action.Root>
      <Flex
        justify='between'
        align='center'
        gap={4}
        sx={{
          [mqu.sm]: {
            flexDirection: 'column',
            alignItems: 'stretch',
          },
        }}
        elementDescriptor={descriptors.apiKeysHeader}
      >
        <Box elementDescriptor={descriptors.apiKeysSearchBox}>
          <SearchInput
            name='apiKeysSearch'
            placeholder={controller.searchPlaceholder}
            aria-label={controller.searchPlaceholder}
            value={controller.searchValue}
            onChange={e => controller.setSearchValue(e.target.value)}
            onClear={() => controller.setSearchValue('')}
            elementDescriptor={descriptors.apiKeysSearchInput}
          />
        </Box>
        {controller.canManageAPIKeys && (
          <Action.Trigger
            value='add-api-key'
            hideOnActive={false}
          >
            <Button
              variant='solid'
              localizationKey={localizationKeys('apiKeys.action__add')}
              elementDescriptor={descriptors.apiKeysAddButton}
            />
          </Action.Trigger>
        )}
      </Flex>
      <Action.Open value='add-api-key'>
        <Flex sx={t => ({ paddingTop: t.space.$6, paddingBottom: t.space.$6 })}>
          <Action.Card sx={{ width: '100%' }}>
            <CreateAPIKeyForm onCreate={controller.handleCreateAPIKey} />
          </Action.Card>
        </Flex>
      </Action.Open>

      <CopyModal
        isOpen={controller.isCopyModalOpen}
        onOpen={controller.onOpenCopyModal}
        onClose={controller.onCloseCopyModal}
        apiKeyName={controller.copyKeyName}
        apiKeySecret={controller.copyKeySecret}
        modalRoot={controller.revokeModalRoot}
      />
    </Action.Root>

    <APIKeysTableView
      rows={controller.rows}
      isLoading={controller.isLoading}
      canManageAPIKeys={controller.canManageAPIKeys}
      elementDescriptor={descriptors.apiKeysTable}
    />
    {controller.pageCount > 1 && (
      <Pagination
        count={controller.pageCount}
        page={Math.min(controller.page, controller.pageCount)}
        onChange={controller.onPageChange}
        siblingCount={1}
        rowInfo={{
          allRowsCount: controller.itemCount,
          startingRow: controller.startingRow,
          endingRow: controller.endingRow,
        }}
      />
    )}

    <RevokeModal
      isOpen={controller.isRevokeModalOpen}
      onOpen={controller.onOpenRevokeModal}
      onClose={controller.onCloseRevokeModal}
      apiKeyID={controller.revokeKeyId}
      apiKeyName={controller.revokeKeyName}
      onRevokeSuccess={controller.onRevokeSuccess}
      modalRoot={controller.revokeModalRoot}
    />
  </Col>
);
