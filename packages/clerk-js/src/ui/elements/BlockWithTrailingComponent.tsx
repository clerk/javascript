import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Box, Flex, Text } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import type { PropsOfComponent } from '../styledSystem';

type BlockWithTrailingComponentProps = PropsOfComponent<typeof Box> & {
  badge?: React.ReactElement;
  trailingComponent?: React.ReactElement;
  textElementDescriptor?: ElementDescriptor;
  textElementId?: ElementId;
  textLocalizationKey?: LocalizationKey;
};

export const BlockWithTrailingComponent = (props: BlockWithTrailingComponentProps) => {
  const {
    isLoading,
    children,
    trailingComponent,
    textElementDescriptor,
    textElementId,
    textLocalizationKey,
    badge,
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
          borderColor: theme.colors.$neutralAlpha200,
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
          variant='buttonSmall'
          localizationKey={textLocalizationKey}
        >
          {children}
        </Text>
        {badge}
      </Flex>
      {trailingComponent}
    </Box>
  );
};
