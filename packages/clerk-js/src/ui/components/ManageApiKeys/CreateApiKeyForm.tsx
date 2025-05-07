import { useState } from 'react';

import { Box, Button, Flex, Input, Text } from '../../customizables';

export const CreateApiKeyForm = ({
  onCreate,
  onCancel,
  loading,
}: {
  onCreate: (name: string) => void;
  onCancel: () => void;
  loading?: boolean;
}) => {
  const [name, setName] = useState('');

  return (
    <Box>
      <Text>Add new API key</Text>
      <Text>Secret key name</Text>
      <Input
        placeholder='Enter a name for your API key'
        value={name}
        onChange={e => setName(e.target.value)}
        sx={{
          width: '100%',
        }}
      />
      <Flex
        justify='end'
        gap={3}
      >
        <Button
          variant='ghost'
          onClick={onCancel}
          sx={{
            fontWeight: 500,
            fontSize: 15,
            px: 4,
            py: 2,
          }}
        >
          Cancel
        </Button>
        <Button
          variant='solid'
          onClick={() => onCreate(name)}
          disabled={!name || loading}
        >
          Create key
        </Button>
      </Flex>
    </Box>
  );
};
