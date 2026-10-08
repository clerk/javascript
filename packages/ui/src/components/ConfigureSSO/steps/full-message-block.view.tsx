import { Box, descriptors, Flex, localizationKeys, Text } from '@/customizables';
import { IconButton } from '@/elements/IconButton';
import { Checkmark, Copy } from '@/icons';

import type { useFullMessageBlockController } from './full-message-block.controller';

export const FullMessageBlockView = ({
  message,
  onCopy,
  hasCopied,
  copyLabel,
}: { message: string } & ReturnType<typeof useFullMessageBlockController>): JSX.Element => {
  return (
    <Flex
      direction='col'
      gap={2}
    >
      <Flex
        justify='between'
        align='center'
        gap={4}
      >
        <Text
          colorScheme='secondary'
          localizationKey={localizationKeys('configureSSO.testConfigurationStep.testRunDetails.runDetails.fullMessage')}
        />
        <IconButton
          elementDescriptor={descriptors.configureSSOTestRunFullMessageCopyButton}
          variant='ghost'
          colorScheme='neutral'
          size='xs'
          icon={hasCopied ? Checkmark : Copy}
          aria-label={copyLabel}
          onClick={() => onCopy()}
        />
      </Flex>
      <Box
        elementDescriptor={descriptors.configureSSOTestRunFullMessage}
        as='pre'
        sx={t => ({
          margin: 0,
          padding: t.space.$3,
          backgroundColor: t.colors.$colorBackground,
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha150,
          borderRadius: t.radii.$md,
          boxShadow: t.shadows.$cardContentShadow,
          fontFamily: t.fonts.$mono,
          fontSize: t.fontSizes.$sm,
          color: t.colors.$colorForeground,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        })}
      >
        {message}
      </Box>
    </Flex>
  );
};
