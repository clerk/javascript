import { isClerkAPIResponseError } from '@clerk/shared/error';
import { isOrganizationId } from '@clerk/shared/internal/clerk-js/organization';
import {
  __experimental_useAPIKeys as useAPIKeys,
  __internal_useOrganizationBase,
  useClerk,
  useUser,
} from '@clerk/shared/react';
import type { APIKeyResource } from '@clerk/shared/types';
import { lazy, useState } from 'react';

import { useProtect } from '@/ui/common';
import { useAPIKeysContext, withCoreUserGuard } from '@/ui/contexts';
import {
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Flow,
  Icon,
  localizationKeys,
  useLocalizations,
} from '@/ui/customizables';
import { Action } from '@/ui/elements/Action';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { InputWithIcon } from '@/ui/elements/InputWithIcon';
import { Pagination } from '@/ui/elements/Pagination';
import { useDebounce } from '@/ui/hooks';
import { MagnifyingGlass } from '@/ui/icons';
import { mqu } from '@/ui/styledSystem';

import { APIKeysTable } from './ApiKeysTable';
import type { OnCreateParams } from './CreateAPIKeyForm';
import { CreateAPIKeyForm } from './CreateAPIKeyForm';
import { useAPIKeysPagination } from './utils';

type APIKeysPageProps = {
  subject: string;
  perPage?: number;
  revokeModalRoot?: React.MutableRefObject<HTMLElement | null>;
};

const RevokeAPIKeyConfirmationModal = lazy(() =>
  import(/* webpackChunkName: "revoke-api-key-modal"*/ './RevokeAPIKeyConfirmationModal').then(module => ({
    default: module.RevokeAPIKeyConfirmationModal,
  })),
);

const CopyAPIKeyModal = lazy(() =>
  import(/* webpackChunkName: "copy-api-key-modal"*/ './CopyAPIKeyModal').then(module => ({
    default: module.CopyAPIKeyModal,
  })),
);

const apiKeysSearchDebounceMs = 500;
const API_KEYS_PAGE_SIZE = 10;

export const APIKeysPage = ({ subject, perPage, revokeModalRoot }: APIKeysPageProps) => {
  const isOrg = isOrganizationId(subject);
  const canReadAPIKeys = useProtect({ permission: 'org:sys_api_keys:read' });
  const canManageAPIKeys = useProtect({ permission: 'org:sys_api_keys:manage' });

  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, apiKeysSearchDebounceMs);
  const query = debouncedSearchValue.trim();

  const {
    data: apiKeys,
    isLoading,
    isFetching,
    page,
    fetchPage,
    pageCount,
    count: itemCount,
    revalidate: invalidateAll,
  } = useAPIKeys({
    subject,
    pageSize: perPage ?? API_KEYS_PAGE_SIZE,
    query,
    keepPreviousData: true,
    enabled: isOrg ? canReadAPIKeys : true,
  });

  useAPIKeysPagination({
    query,
    page,
    pageCount,
    isFetching,
    fetchPage,
  });

  const startingRow = itemCount > 0 ? Math.max(0, (page - 1) * (perPage ?? API_KEYS_PAGE_SIZE)) + 1 : 0;
  const endingRow = Math.min(page * (perPage ?? API_KEYS_PAGE_SIZE), itemCount);

  const handlePageChange = (newPage: number) => {
    fetchPage(newPage);
  };
  const card = useCardState();
  const clerk = useClerk();

  const [apiKey, setAPIKey] = useState<APIKeyResource | null>(null);

  const { t } = useLocalizations();
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [selectedAPIKeyID, setSelectedAPIKeyID] = useState('');
  const [selectedAPIKeyName, setSelectedAPIKeyName] = useState('');
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  const handleCreateAPIKey = async (params: OnCreateParams) => {
    try {
      card.setLoading();
      const apiKey = await clerk.apiKeys.create({
        ...params,
        subject,
      });
      invalidateAll();
      card.setError(undefined);
      setIsCopyModalOpen(true);
      setAPIKey(apiKey);
    } catch (err: any) {
      if (isClerkAPIResponseError(err)) {
        if (err.status === 409) {
          card.setError('API Key name already exists');
        }
      }
    } finally {
      card.setIdle();
    }
  };

  const handleRevoke = (apiKeyID: string, apiKeyName: string) => {
    setSelectedAPIKeyID(apiKeyID);
    setSelectedAPIKeyName(apiKeyName);
    setIsRevokeModalOpen(true);
  };

  return (
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
            <InputWithIcon
              placeholder={t(localizationKeys('apiKeys.action__search'))}
              leftIcon={
                <Icon
                  icon={MagnifyingGlass}
                  sx={t => ({ color: t.colors.$colorMutedForeground })}
                />
              }
              value={searchValue}
              type='search'
              autoCapitalize='none'
              spellCheck={false}
              onChange={e => setSearchValue(e.target.value)}
              elementDescriptor={descriptors.apiKeysSearchInput}
            />
          </Box>
          {((isOrg && canManageAPIKeys) || !isOrg) && (
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
              <CreateAPIKeyForm onCreate={handleCreateAPIKey} />
            </Action.Card>
          </Flex>
        </Action.Open>

        <CopyAPIKeyModal
          isOpen={isCopyModalOpen}
          onOpen={() => setIsCopyModalOpen(true)}
          onClose={() => setIsCopyModalOpen(false)}
          apiKeyName={apiKey?.name || ''}
          apiKeySecret={apiKey?.secret || ''}
          modalRoot={revokeModalRoot}
        />
      </Action.Root>

      <APIKeysTable
        rows={apiKeys}
        isLoading={isLoading}
        onRevoke={handleRevoke}
        elementDescriptor={descriptors.apiKeysTable}
        canManageAPIKeys={(isOrg && canManageAPIKeys) || !isOrg}
      />
      {pageCount > 1 && (
        <Pagination
          count={pageCount}
          page={Math.min(page, pageCount)}
          onChange={handlePageChange}
          siblingCount={1}
          rowInfo={{ allRowsCount: itemCount, startingRow, endingRow }}
        />
      )}

      <RevokeAPIKeyConfirmationModal
        isOpen={isRevokeModalOpen}
        onOpen={() => setIsRevokeModalOpen(true)}
        onClose={() => {
          setSelectedAPIKeyID('');
          setSelectedAPIKeyName('');
          setIsRevokeModalOpen(false);
        }}
        apiKeyID={selectedAPIKeyID}
        apiKeyName={selectedAPIKeyName}
        onRevokeSuccess={invalidateAll}
        modalRoot={revokeModalRoot}
      />
    </Col>
  );
};

const _APIKeys = () => {
  const ctx = useAPIKeysContext();
  const { user } = useUser();
  // Do not use `useOrganization` to avoid triggering the in-app enable organizations prompt in development instance
  const organization = __internal_useOrganizationBase();

  const subject = organization?.id ?? user?.id ?? '';

  return (
    <Flow.Root
      flow='apiKeys'
      sx={{
        width: '100%',
      }}
    >
      <APIKeysPage
        subject={subject}
        perPage={ctx.perPage}
      />
    </Flow.Root>
  );
};

export const APIKeys = withCoreUserGuard(withCardStateProvider(_APIKeys));
