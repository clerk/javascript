import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { CreateAPIKeyParams } from '@clerk/shared/types';
import { lazy, useState } from 'react';
import useSWRMutation from 'swr/mutation';

import { useProtect } from '@/ui/common';
import { useApiKeysContext, withCoreUserGuard } from '@/ui/contexts';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Flow,
  Icon,
  localizationKeys,
  Text,
  useLocalizations,
} from '@/ui/customizables';
import { Action } from '@/ui/elements/Action';
import { ClipboardInput } from '@/ui/elements/ClipboardInput';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { InputWithIcon } from '@/ui/elements/InputWithIcon';
import { Pagination } from '@/ui/elements/Pagination';
import { Check, ClipboardOutline, MagnifyingGlass } from '@/ui/icons';
import { mqu } from '@/ui/styledSystem';
import { isOrganizationId } from '@/utils';

import { ApiKeysTable } from './ApiKeysTable';
import type { OnCreateParams } from './CreateApiKeyForm';
import { CreateApiKeyForm } from './CreateApiKeyForm';
import { useApiKeys } from './useApiKeys';

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

export const APIKeysPage = ({ subject, perPage, revokeModalRoot }: APIKeysPageProps) => {
  const isOrg = isOrganizationId(subject);
  const canReadAPIKeys = useProtect({ permission: 'org:sys_api_keys:read' });
  const canManageAPIKeys = useProtect({ permission: 'org:sys_api_keys:manage' });

  const {
    apiKeys,
    isLoading,
    search,
    setSearch,
    page,
    setPage,
    pageCount,
    itemCount,
    startingRow,
    endingRow,
    cacheKey,
  } = useApiKeys({ subject, perPage, enabled: isOrg ? canReadAPIKeys : true });
  const card = useCardState();
  const clerk = useClerk();
  const {
    data: createdApiKey,
    trigger: createApiKey,
    isMutating,
  } = useSWRMutation(cacheKey, (_, { arg }: { arg: CreateAPIKeyParams }) => clerk.apiKeys.create(arg));
  const { t } = useLocalizations();
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [selectedApiKeyId, setSelectedApiKeyId] = useState('');
  const [selectedApiKeyName, setSelectedApiKeyName] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  const handleCreateApiKey = async (params: OnCreateParams, closeCardFn: () => void) => {
    try {
      await createApiKey({
        ...params,
        subject,
      });
      closeCardFn();
      card.setError(undefined);
      setShowCopyAlert(true);
    } catch (err: any) {
      if (isClerkAPIResponseError(err)) {
        if (err.status === 409) {
          card.setError('API Key name already exists');
        }
      }
    }
  };

  const handleRevoke = (apiKeyId: string, apiKeyName: string) => {
    setSelectedApiKeyId(apiKeyId);
    setSelectedApiKeyName(apiKeyName);
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
              leftIcon={<Icon icon={MagnifyingGlass} />}
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
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
              <CreateApiKeyForm
                onCreate={handleCreateApiKey}
                isSubmitting={isMutating}
              />
            </Action.Card>
          </Flex>
        </Action.Open>
      </Action.Root>

      {showCopyAlert ? (
        <Alert
          elementDescriptor={descriptors.alert}
          elementId={descriptors.alert.setId('warning')}
          colorScheme='warning'
          align='start'
        >
          <AlertIcon
            elementId={descriptors.alert.setId('warning')}
            elementDescriptor={descriptors.alertIcon}
            variant='warning'
            colorScheme='warning'
            sx={{ flexShrink: 0 }}
          />
          <Col
            elementDescriptor={descriptors.alertTextContainer}
            elementId={descriptors.alertTextContainer.setId('warning')}
            gap={1}
            sx={{ flex: 1 }}
          >
            <Text
              elementDescriptor={descriptors.alertText}
              variant='body'
              localizationKey={`Save your "${createdApiKey?.name}" API Key now`}
              sx={{ textAlign: 'left' }}
            />
            <Text
              elementDescriptor={descriptors.alertText}
              variant='body'
              colorScheme='secondary'
              localizationKey={`For security reasons, we won't allow you to view it again later.`}
              sx={{ textAlign: 'left' }}
            />
            <ClipboardInput
              value={createdApiKey?.secret ?? ''}
              readOnly
              sx={{ width: '100%' }}
              copyIcon={ClipboardOutline}
              copiedIcon={Check}
            />
          </Col>
        </Alert>
      ) : null}
      <ApiKeysTable
        rows={apiKeys}
        isLoading={isLoading}
        onRevoke={handleRevoke}
        elementDescriptor={descriptors.apiKeysTable}
        canManageAPIKeys={(isOrg && canManageAPIKeys) || !isOrg}
      />
      {itemCount > (perPage ?? 5) && (
        <Pagination
          count={pageCount}
          page={page}
          onChange={setPage}
          siblingCount={1}
          rowInfo={{ allRowsCount: itemCount, startingRow, endingRow }}
        />
      )}
      <RevokeAPIKeyConfirmationModal
        subject={subject}
        isOpen={isRevokeModalOpen}
        onOpen={() => setIsRevokeModalOpen(true)}
        onClose={() => {
          setSelectedApiKeyId('');
          setSelectedApiKeyName('');
          setIsRevokeModalOpen(false);
        }}
        apiKeyId={selectedApiKeyId}
        apiKeyName={selectedApiKeyName}
        modalRoot={revokeModalRoot}
      />
    </Col>
  );
};

const _APIKeys = () => {
  const ctx = useApiKeysContext();
  const { user } = useUser();
  const { organization } = useOrganization();

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
