import type { ComponentType } from 'react';

import { Box, Dd, Dl, Dt, Flex, Icon, localizationKeys, Text, useLocalizations } from '@/ui/customizables';
import { IconButton } from '@/ui/elements/IconButton';
import { useClipboard } from '@/ui/hooks';
import { Checkmark, Copy } from '@/ui/icons';
import { animations } from '@/ui/styledSystem';

export type ActionDetail = {
  key: string;
  label: string;
  value: string;
  secondaryValue?: string;
  icon?: ComponentType;
  copyable?: boolean;
};

export function ActionDetails({ details }: { details: ActionDetail[] }) {
  const { t } = useLocalizations();

  if (details.length === 0) {
    return null;
  }

  return (
    <Dl
      aria-label={t(localizationKeys('agentActionApproval.detailsLabel'))}
      sx={theme => ({
        borderWidth: theme.borderWidths.$normal,
        borderStyle: theme.borderStyles.$solid,
        borderColor: theme.colors.$borderAlpha150,
        borderRadius: theme.radii.$md,
        overflow: 'hidden',
      })}
    >
      {details.map(detail => (
        <ActionDetailRow
          key={detail.key}
          detail={detail}
        />
      ))}
    </Dl>
  );
}

function ActionDetailRow({ detail }: { detail: ActionDetail }) {
  const { t } = useLocalizations();
  const { onCopy, hasCopied } = useClipboard(detail.value);

  return (
    <Box
      as='div'
      sx={theme => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.space.$4,
        paddingInline: theme.space.$3,
        paddingBlock: theme.space.$3x5,
        '&:not(:first-child)': {
          borderBlockStartWidth: theme.borderWidths.$normal,
          borderBlockStartStyle: theme.borderStyles.$solid,
          borderBlockStartColor: theme.colors.$borderAlpha100,
        },
      })}
    >
      <Dt sx={{ flexShrink: 0 }}>
        <Text colorScheme='secondary'>{detail.label}</Text>
      </Dt>
      <Dd sx={{ minWidth: 0, maxWidth: '70%' }}>
        <Flex
          as='span'
          align='center'
          justify='end'
          gap={1}
          sx={{ minWidth: 0 }}
        >
          {detail.icon ? (
            <Icon
              icon={detail.icon}
              colorScheme='neutral'
              aria-hidden
            />
          ) : null}
          <Text
            as='span'
            truncate
          >
            {detail.value}
          </Text>
          {detail.secondaryValue ? (
            <Text
              as='span'
              colorScheme='secondary'
              truncate
            >
              {detail.secondaryValue}
            </Text>
          ) : null}
          {detail.copyable ? (
            <IconButton
              variant='ghost'
              colorScheme='neutral'
              aria-label={t(
                localizationKeys(
                  hasCopied ? 'agentActionApproval.parameterCopied' : 'agentActionApproval.copyParameter',
                  { parameter: detail.label },
                ),
              )}
              icon={
                <Icon
                  icon={hasCopied ? Checkmark : Copy}
                  size='md'
                  sx={theme => ({
                    color: hasCopied ? theme.colors.$success500 : 'inherit',
                    animation: hasCopied
                      ? `${animations.fadeIn} ${theme.transitionDuration.$fast} ${theme.transitionTiming.$common}`
                      : undefined,
                    '@media (prefers-reduced-motion: reduce)': {
                      animation: 'none',
                    },
                  })}
                />
              }
              onClick={() => onCopy()}
              sx={theme => ({
                width: theme.sizes.$6,
                height: theme.sizes.$6,
                padding: 0,
                borderRadius: theme.radii.$sm,
                flexShrink: 0,
              })}
            />
          ) : null}
        </Flex>
      </Dd>
    </Box>
  );
}
