import React, { MouseEvent } from 'react';

import type { LocalizationKey } from '../customizables';
import { Box, Button, Flex, Text } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';

type ArrowBlockButtonProps = PropsOfComponent<typeof Box> & {
  actionSx?: ThemableCssProp;
  badge?: React.ReactElement;
  textElementDescriptor?: ElementDescriptor;
  textElementId?: ElementId;
  textLocalizationKey?: LocalizationKey;
  actionLabel?: LocalizationKey;
  onActionClick?: (e: MouseEvent<HTMLButtonElement>) => void | Promise<void | unknown>;
};

export const BlockWithAction = (props: ArrowBlockButtonProps) => {
  const {
    actionSx,
    isLoading,
    children,
    textElementDescriptor,
    textElementId,
    textLocalizationKey,
    badge,
    onActionClick,
    actionLabel,
    ...rest
  } = props;

  return (
    <Box
      isLoading={isLoading}
      {...rest}
      sx={theme => [
        {
          borderRadius: theme.radii.$md,
          display: 'inline-flex',
          alignItems: 'center',
          gap: theme.space.$4,
          position: 'relative',
          justifyContent: 'flex-start',
          borderColor: theme.colors.$blackAlpha200,
          '--action-opacity': '0',
          '--action-transform': `translateX(-${theme.space.$2});`,
          '&:hover,&:focus ': {
            '--action-opacity': '1',
            '--action-transform': 'translateX(0px);',
          },
        },
        props.sx,
      ]}
    >
      <Flex
        justify='start'
        align='center'
        gap={2}
        sx={{
          flexGrow: '1',
          overflow: 'hidden',
        }}
      >
        <Text
          elementDescriptor={textElementDescriptor}
          elementId={textElementId}
          as='span'
          truncate
          colorScheme='inherit'
          variant='buttonSmallRegular'
          localizationKey={textLocalizationKey}
        >
          {children}
        </Text>
        {badge}
      </Flex>
      <Button
        variant={'link'}
        sx={[
          theme => ({
            whiteSpace: 'nowrap',
            transition: 'all 100ms ease',
            minWidth: theme.sizes.$4,
            minHeight: theme.sizes.$4,
            opacity: `var(--action-opacity)`,
            transform: `var(--action-transform)`,
          }),
          actionSx,
        ]}
        onClick={onActionClick}
        localizationKey={actionLabel}
      />
    </Box>
  );
};
