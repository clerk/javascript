import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { CreateApiKeyParams } from '@clerk/types';
import useSWRMutation from 'swr/mutation';

import { useApiKeysContext } from '../../contexts';
import { Box, Button, Col, Flex, Flow, Icon, localizationKeys, useLocalizations } from '../../customizables';
import { Card, InputWithIcon, Pagination, withCardStateProvider } from '../../elements';
import { Action } from '../../elements/Action';
import { MagnifyingGlass } from '../../icons';
import { ApiKeysTable } from './ApiKeysTable';
import type { OnCreateParams } from './CreateApiKeyForm';
import { CreateApiKeyForm } from './CreateApiKeyForm';
import { getTimeLeftInSeconds, useApiKeys } from './useApiKeys';

export const ApiKeysInternal = ({ subject, perPage }: { subject: string; perPage?: number }) => {
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
    mutate: mutateApiKeys,
    cacheKey,
  } = useApiKeys({ subject, perPage });
  const { trigger: createApiKey, isMutating } = useSWRMutation(
    cacheKey,
    (_, { arg }: { arg: CreateApiKeyParams }) => clerk.createApiKey(arg),
    {
      throwOnError: false,
      onError(err) {
        if (isClerkAPIResponseError(err)) {
          console.log(err.errors);
          console.log(err.message);
          console.log(err.name);
        }
      },
    },
  );
  const { t } = useLocalizations();
  const clerk = useClerk();

  const handleRevokeApiKey = async (id: string) => {
    await clerk.revokeApiKey({ apiKeyID: id });
    void mutateApiKeys();
    setPage(1);
  };

  const handleCreateApiKey = async (params: OnCreateParams, closeCardFn: () => void) => {
    await createApiKey({
      name: params.name,
      creationReason: params.description,
      secondsUntilExpiration: getTimeLeftInSeconds(params.expiration),
    });
    closeCardFn();
  };

  return (
    <Col gap={4}>
      <Action.Root>
        <Flex
          justify='between'
          align='center'
        >
          <Box>
            <InputWithIcon
              placeholder={t(localizationKeys('apiKey.action__search'))}
              leftIcon={<Icon icon={MagnifyingGlass} />}
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </Box>
          <Action.Trigger
            value='add'
            hideOnActive={false}
          >
            <Button
              variant='solid'
              localizationKey={localizationKeys('apiKey.action__add')}
            />
          </Action.Trigger>
        </Flex>
        <Action.Open value='add'>
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
        onRevoke={handleRevokeApiKey}
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
    </Col>
  );
};

export const ApiKeys = withCardStateProvider(() => {
  const ctx = useApiKeysContext();
  const { user } = useUser();
  const { organization } = useOrganization();

  return (
    <Flow.Root flow='apiKey'>
      <Card.Root sx={{ width: '100%' }}>
        <Card.Content sx={{ textAlign: 'left' }}>
          <ApiKeysInternal
            subject={ctx.subject ?? organization?.id ?? user?.id ?? ''}
            perPage={ctx.perPage}
          />
        </Card.Content>
      </Card.Root>
    </Flow.Root>
  );
});
