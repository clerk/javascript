import { useOrganization, useUser } from '@clerk/shared/react';

import { useApiKeysContext } from '../../contexts';
import { Box, Button, Col, Flex, Flow, Icon } from '../../customizables';
import { Card, InputWithIcon, Pagination, withCardStateProvider } from '../../elements';
import { Action } from '../../elements/Action';
import { MagnifyingGlass } from '../../icons';
import { ApiKeysTable } from './ApiKeysTable';
import { CreateApiKeyForm } from './CreateApiKeyForm';
import { useApiKeys } from './shared';

export const ApiKeysInternal = ({ subject }: { subject: string }) => {
  const {
    apiKeys,
    isLoading,
    revokeApiKey,
    search,
    setSearch,
    page,
    setPage,
    pageCount,
    itemCount,
    startingRow,
    endingRow,
    handleCreate,
  } = useApiKeys({ subject });

  return (
    <Col gap={4}>
      <Action.Root>
        <Flex
          justify='between'
          align='center'
        >
          <Box>
            <InputWithIcon
              placeholder='Search keys'
              leftIcon={<Icon icon={MagnifyingGlass} />}
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </Box>
          <Action.Trigger value='add'>
            <Button variant='solid'>Add new key</Button>
          </Action.Trigger>
        </Flex>
        <Action.Open value='add'>
          <Flex sx={t => ({ paddingTop: t.space.$6, paddingBottom: t.space.$6 })}>
            <Action.Card sx={{ width: '100%' }}>
              <CreateApiKeyForm onCreate={params => void handleCreate(params)} />
            </Action.Card>
          </Flex>
        </Action.Open>
      </Action.Root>
      <ApiKeysTable
        rows={apiKeys}
        isLoading={isLoading}
        onRevoke={revokeApiKey}
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
          <ApiKeysInternal subject={ctx.subject ?? organization?.id ?? user?.id ?? ''} />
        </Card.Content>
      </Card.Root>
    </Flow.Root>
  );
});
