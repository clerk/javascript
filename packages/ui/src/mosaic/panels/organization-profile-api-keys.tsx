import { MagnifyingGlass, Selector } from '../../icons';
import { Box } from '../components/box';
import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Text } from '../components/text';

interface MockApiKey {
  id: string;
  name: string;
  lastUsed: string;
  expires: string;
}

const MOCK_API_KEYS: MockApiKey[] = [{ id: '1', name: 'api_key', lastUsed: 'Jun 16, 2026', expires: 'June 23, 2026' }];

export function OrganizationProfileApiKeys() {
  return (
    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(4), width: '100%' })}>
      {/* Header */}
      <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2) })}>
        <Heading
          size='xl'
          sx={() => ({ flex: 1 })}
        >
          API Keys
        </Heading>
        <Button
          variant='filled'
          intent='primary'
        >
          Add key
        </Button>
      </Box>

      {/* Table */}
      <Box
        sx={t => ({
          border: `1px solid ${t.color.border}`,
          borderRadius: '8px',
          overflow: 'hidden',
        })}
      >
        {/* Top bar */}
        <Box
          sx={t => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingInline: t.spacing(3),
            paddingBlock: t.spacing(1),
            gap: t.spacing(2),
          })}
        >
          <Box
            sx={t => ({
              display: 'flex',
              alignItems: 'center',
              gap: t.spacing(2),
              flex: 1,
              color: t.color.mutedForeground,
            })}
          >
            <MagnifyingGlass
              width={14}
              height={14}
              style={{ flexShrink: 0 }}
            />
            <Text
              size='sm'
              intent='mutedForeground'
              render={p => <span {...p} />}
            >
              Search
            </Text>
          </Box>
          <Button
            variant='outline'
            intent='primary'
            size='sm'
            sx={t => ({ color: t.color.mutedForeground, padding: t.spacing(1) })}
          >
            <Selector
              width={14}
              height={14}
            />
          </Button>
        </Box>

        {/* Column headers */}
        <Box
          sx={t => ({
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            borderTop: `1px solid ${t.color.border}`,
            background: t.color.muted,
          })}
        >
          {(['Date', 'Last used', 'Expires'] as const).map(col => (
            <Box
              key={col}
              sx={t => ({ paddingBlock: t.spacing(1.5), paddingInline: t.spacing(3) })}
            >
              <Text
                size='xs'
                intent='mutedForeground'
              >
                {col}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Key rows */}
        {MOCK_API_KEYS.map(key => (
          <Box
            key={key.id}
            sx={t => ({
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              borderTop: `1px solid ${t.color.border}`,
            })}
          >
            <Box sx={t => ({ padding: t.spacing(3) })}>
              <Text
                size='sm'
                sx={t => ({ fontWeight: t.font.medium })}
              >
                {key.name}
              </Text>
            </Box>
            <Box sx={t => ({ padding: t.spacing(3) })}>
              <Text
                size='xs'
                intent='mutedForeground'
              >
                {key.lastUsed}
              </Text>
            </Box>
            <Box sx={t => ({ padding: t.spacing(3) })}>
              <Text
                size='xs'
                intent='mutedForeground'
              >
                {key.expires}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
