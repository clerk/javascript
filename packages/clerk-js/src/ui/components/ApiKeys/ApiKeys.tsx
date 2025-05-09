import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import { useState } from 'react';

import { useApiKeysContext } from '../../contexts';
import { Box, Button, Col, Flex, Flow, Icon } from '../../customizables';
import { Card, InputWithIcon, Pagination, withCardStateProvider } from '../../elements';
import { Action } from '../../elements/Action';
import { useClipboard } from '../../hooks';
import { Clipboard, MagnifyingGlass } from '../../icons';
import { ApiKeysTable } from './ApiKeysTable';
import type { Expiration } from './CreateApiKeyForm';
import { CreateApiKeyForm } from './CreateApiKeyForm';
import { useApiKeys } from './shared';

export const CopyButton = ({ apiKeyID }: { apiKeyID: string }) => {
  const clerk = useClerk();
  const [text, setText] = useState('');
  const { onCopy, hasCopied } = useClipboard(text);

  const fetchSecret = async () => {
    const secret = await clerk.getApiKeySecret(apiKeyID);
    setText(secret);
    onCopy();
  };

  return (
    <Button
      variant='ghost'
      onClick={() => void fetchSecret()}
      size='sm'
      sx={{ margin: 1 }}
      aria-label={hasCopied ? 'Copied' : 'Copy key'}
    >
      <Icon icon={Clipboard} />
    </Button>
  );
};

export const ApiKeysInternal = ({
  apiKeys,
  isLoading,
  revealedKeys,
  toggleSecret,
  revokeApiKey,
  CopyButton,
  search,
  setSearch,
  page,
  setPage,
  pageCount,
  itemCount,
  startingRow,
  endingRow,
  handleCreate,
}: {
  apiKeys: any[];
  isLoading: boolean;
  revealedKeys: Record<string, string | null>;
  toggleSecret: (id: string) => void;
  revokeApiKey: (id: string) => void;
  CopyButton: React.ComponentType<{ apiKeyID: string }>;
  search: string;
  setSearch: (s: string) => void;
  page: number;
  setPage: (n: number) => void;
  pageCount: number;
  itemCount: number;
  startingRow: number;
  endingRow: number;
  handleCreate: (params: { name: string; description?: string; expiration: Expiration; closeFn: () => void }) => void;
}) => {
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
        apiKeys={apiKeys}
        isLoading={isLoading}
        revealedKeys={revealedKeys}
        toggleSecret={toggleSecret}
        revokeApiKey={revokeApiKey}
        CopyButton={CopyButton}
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
  const apiKeysManager = useApiKeys(ctx.subject ?? organization?.id ?? user?.id ?? '', ctx.perPage);
  return (
    <Flow.Root flow='apiKey'>
      <Card.Root sx={{ width: '100%' }}>
        <Card.Content sx={{ textAlign: 'left' }}>
          <ApiKeysInternal
            {...apiKeysManager}
            CopyButton={CopyButton}
          />
        </Card.Content>
      </Card.Root>
    </Flow.Root>
  );
});
