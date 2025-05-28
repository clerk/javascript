import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { CreateAPIKeyParams } from '@clerk/types';
import { lazy, useState } from 'react';
import useSWRMutation from 'swr/mutation';

import { useApiKeysContext, withCoreUserGuard } from '../../contexts';
import { Box, Button, Col, Flex, Flow, Icon, localizationKeys, useLocalizations } from '../../customizables';
import { InputWithIcon, Pagination, useCardState, withCardStateProvider } from '../../elements';
import { Action } from '../../elements/Action';
import { MagnifyingGlass } from '../../icons';
import { mqu } from '../../styledSystem';
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
  } = useApiKeys({ subject, perPage });
  const card = useCardState();
  const { trigger: createApiKey, isMutating } = useSWRMutation(cacheKey, (_, { arg }: { arg: CreateAPIKeyParams }) =>
    clerk.createApiKey(arg),
  );
  const { t } = useLocalizations();
  const clerk = useClerk();
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [selectedApiKeyId, setSelectedApiKeyId] = useState('');
  const [selectedApiKeyName, setSelectedApiKeyName] = useState('');

  const handleCreateApiKey = async (params: OnCreateParams, closeCardFn: () => void) => {
    try {
      await createApiKey(params);
      closeCardFn();
      card.setError(undefined);
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
        >
          <Box>
            <InputWithIcon
              placeholder={t(localizationKeys('apiKeys.action__search'))}
              leftIcon={<Icon icon={MagnifyingGlass} />}
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </Box>
          <Action.Trigger
            value='add-api-key'
            hideOnActive={false}
          >
            <Button
              variant='solid'
              localizationKey={localizationKeys('apiKeys.action__add')}
            />
          </Action.Trigger>
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
      <ApiKeysTable
        rows={apiKeys}
        isLoading={isLoading}
        onRevoke={handleRevoke}
      />
      {itemCount > 5 && (
        <Pagination
          count={pageCount}
          page={page}
          onChange={setPage}
          siblingCount={1}
          rowInfo={{ allRowsCount: itemCount, startingRow, endingRow }}
        />
      )}
      <RevokeAPIKeyConfirmationModal
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
