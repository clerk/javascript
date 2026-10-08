import { Button, Flex, Icon, Td, Text } from '@/customizables';
import { Tooltip } from '@/elements/Tooltip';
import { Checkmark, Clipboard } from '@/icons';
import { truncateWithEndVisible } from '@/ui/utils/truncateTextWithEndVisible';

import type { useMicrosoftClaimNameCellController } from './microsoft-claim-name-cell.controller';
import type { useMicrosoftClaimNameCellModel } from './microsoft-claim-name-cell.model';

type Props = ReturnType<typeof useMicrosoftClaimNameCellController> & ReturnType<typeof useMicrosoftClaimNameCellModel>;

export const MicrosoftClaimNameCellView = ({
  claimNameKey,
  claimName,
  copyLabel,
  copiedLabel,
  onCopy,
  hasCopied,
}: Props): JSX.Element => {
  return (
    <Td sx={{ maxWidth: 0, width: '100%' }}>
      <Flex
        as='span'
        align='center'
        sx={theme => ({ gap: theme.space.$1 })}
      >
        <Tooltip.Root>
          <Tooltip.Trigger>
            <Text
              as='span'
              sx={{
                fontFamily: 'monospace',
                display: 'block',
                whiteSpace: 'nowrap',
              }}
            >
              {/* Middle-truncate so the meaningful end of the claim URI (e.g. "emailaddress") stays visible. */}
              {truncateWithEndVisible(claimName, 32, 12)}
            </Text>
          </Tooltip.Trigger>
          <Tooltip.Content
            text={claimNameKey}
            textSx={{ overflowWrap: 'anywhere' }}
          />
        </Tooltip.Root>
        <Button
          variant='ghost'
          onClick={() => onCopy()}
          aria-label={hasCopied ? copiedLabel : copyLabel}
          sx={theme => ({
            padding: 0,
            height: theme.sizes.$5,
            aspectRatio: 1,
            borderRadius: theme.radii.$sm,
            color: theme.colors.$colorMutedForeground,
          })}
        >
          <Icon
            size='sm'
            icon={hasCopied ? Checkmark : Clipboard}
            aria-hidden
          />
        </Button>
      </Flex>
    </Td>
  );
};
