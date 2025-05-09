import type { ApiKeyResource } from '@clerk/types';

import { Button, Flex, Icon, Input, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../customizables';
import { ThreeDotsMenu } from '../../elements';
import { useClipboard } from '../../hooks';
import { Clipboard, Eye } from '../../icons';

const CopyButton = ({ text }: { text: string }) => {
  const { onCopy } = useClipboard(text);
  return (
    <Button
      variant='ghost'
      size='sm'
      sx={{ margin: 1 }}
      aria-label={'Copy key'}
      onClick={onCopy}
    >
      <Icon icon={Clipboard} />
    </Button>
  );
};

export const ApiKeysTable = ({
  rows,
  isLoading,
  onRevoke,
}: {
  rows: ApiKeyResource[];
  isLoading: boolean;
  onRevoke: (id: string) => void;
}) => {
  return (
    <Table sx={{ tableLayout: 'fixed' }}>
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Last used</Th>
          <Th>Key</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {isLoading ? (
          <Tr>
            <Td colSpan={4}>
              <Spinner
                colorScheme='primary'
                sx={{ margin: 'auto', display: 'block' }}
              />
            </Td>
          </Tr>
        ) : (
          rows.map(apiKey => (
            <Tr key={apiKey.id}>
              <Td>
                <Text sx={{ fontWeight: 500 }}>{apiKey.name}</Text>
                <Text
                  sx={{ fontSize: 12 }}
                  color='gray.600'
                >
                  Created at{' '}
                  {apiKey.createdAt.toLocaleDateString(undefined, {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              </Td>
              <Td>
                <Text
                  sx={{ fontSize: 14 }}
                  color='gray.800'
                >
                  3d ago
                </Text>
              </Td>
              <Td>
                <Flex
                  direction='row'
                  gap={1}
                >
                  <Flex
                    center
                    sx={{
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    <Input
                      type='password'
                      value='•••••••••••••••••••••••••'
                      readOnly
                      aria-label='API key (hidden)'
                      tabIndex={-1}
                    />
                    <Button
                      variant='ghost'
                      size='sm'
                      sx={{ position: 'absolute', right: 0 }}
                      aria-label={'Show key'}
                    >
                      {/* <Icon icon={revealedKeys[apiKey.id] ? EyeSlash : Eye} /> */}
                      <Icon icon={Eye} />
                    </Button>
                  </Flex>
                  <CopyButton text='•••••••••••••••••••••••••' />
                </Flex>
              </Td>
              <Td>
                <ThreeDotsMenu
                  actions={[
                    {
                      // @ts-expect-error: TODO: Add locales
                      label: 'Revoke key',
                      isDestructive: true,
                      onClick: () => onRevoke(apiKey.id),
                      isDisabled: false,
                    },
                  ]}
                  elementId={'member'}
                />
              </Td>
            </Tr>
          ))
        )}
      </Tbody>
    </Table>
  );
};
