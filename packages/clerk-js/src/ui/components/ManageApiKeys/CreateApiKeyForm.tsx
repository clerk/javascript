import React, { useState } from 'react';

import { Box, Button, Flex, Input, Text } from '../../customizables';
import { Select } from '../../elements';

interface CreateApiKeyFormProps {
  onCreate: (params: { name: string; description?: string; expiration?: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

const DURATIONS = [
  { label: 'Never', value: '' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  // { label: 'Custom', value: 'custom' },
];

export const CreateApiKeyForm: React.FC<CreateApiKeyFormProps> = ({ onCreate, onCancel, loading }) => {
  const [name, setName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expiration, setExpiration] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name,
      description: showAdvanced ? description : undefined,
      expiration: showAdvanced ? expiration : undefined,
    });
  };

  return (
    <Box
      as='form'
      onSubmit={handleSubmit}
      sx={{ mb: 4, p: 4, border: '1px solid', borderColor: 'gray.200', borderRadius: 'md', bg: 'white' }}
    >
      <Flex
        direction='col'
        gap={3}
      >
        <label htmlFor='name'>
          <Text
            as='span'
            sx={{ mb: 1, display: 'block' }}
          >
            Name
          </Text>
          <Input
            id='name'
            placeholder='API key name'
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>
        <Button
          variant='ghost'
          type='button'
          onClick={() => setShowAdvanced(v => !v)}
          sx={{ alignSelf: 'flex-start', fontSize: 14 }}
        >
          {showAdvanced ? 'Hide advanced settings' : 'Advanced settings'}
        </Button>
        {showAdvanced && (
          <>
            <Box>
              <Text
                as='span'
                sx={{ mb: 1, display: 'block' }}
              >
                Description
              </Text>
              <Input
                id='description'
                placeholder='API key description'
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </Box>
            <Box>
              <Text
                as='span'
                sx={{ mb: 1, display: 'block' }}
              >
                Expiration
              </Text>
              <Select
                options={DURATIONS}
                value={expiration}
                onChange={option => setExpiration(option.value || '')}
                placeholder='Select expiration'
              />
            </Box>
          </>
        )}
        <Flex gap={2}>
          <Button
            type='submit'
            variant='solid'
            isLoading={loading}
            disabled={!name}
          >
            Create
          </Button>
          <Button
            type='button'
            variant='ghost'
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
