import React from 'react';

import { Button, Flex, Icon, Spinner, Text } from '../customizables';
import { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { ArrowRightIcon } from '../icons';
import { PropsOfComponent, ThemableCssProp } from '../styledSystem';

type ArrowBlockButtonProps = PropsOfComponent<typeof Button> & {
  icon?: React.ReactElement;
  rightIcon?: React.ComponentType;
  rightIconSx?: ThemableCssProp;
  textElementDescriptor?: ElementDescriptor;
  textElementId?: ElementId;
  arrowElementDescriptor?: ElementDescriptor;
  arrowElementId?: ElementId;
  spinnerElementDescriptor?: ElementDescriptor;
  spinnerElementId?: ElementId;
};

export const ArrowBlockButton = (props: ArrowBlockButtonProps) => {
  const {
    rightIcon = ArrowRightIcon,
    rightIconSx,
    isLoading,
    icon,
    children,
    textElementDescriptor,
    textElementId,
    spinnerElementDescriptor,
    spinnerElementId,
    arrowElementDescriptor,
    arrowElementId,
    ...rest
  } = props;

  // TODO: Replace this with a simple Icon prop like left icon
  // This was implemented this way to allow for setting its descriptor
  // from the outside, but we can use `leftIconDescriptor` pattern instead
  const leftIcon = icon
    ? React.cloneElement(icon, {
        sx: [
          icon.props.sx,
          (theme: any) => ({
            width: theme.sizes.$4,
            position: 'absolute',
          }),
        ],
      })
    : null;

  return (
    <Button
      variant='outline'
      colorScheme='neutral'
      block
      {...rest}
      sx={theme => [
        {
          gap: theme.space.$4,
          position: 'relative',
          justifyContent: 'flex-start',
          // color: theme.colors.$colorText,
          borderColor: theme.colors.$blackAlpha200,
          '--arrow-opacity': '0',
          '--arrow-transform': `translateX(-${theme.space.$2});`,
          '&:hover,&:focus ': {
            '--arrow-opacity': '0.5',
            '--arrow-transform': 'translateX(0px);',
          },
        },
        props.sx,
      ]}
    >
      {(leftIcon || isLoading) && (
        <Flex
          as='span'
          center
          sx={theme => ({ flex: `0 0 ${theme.space.$4}` })}
        >
          {isLoading ? (
            <Spinner
              elementDescriptor={spinnerElementDescriptor}
              elementId={spinnerElementId}
              sx={{ position: 'absolute' }}
              size={'sm'}
            />
          ) : (
            leftIcon
          )}
        </Flex>
      )}
      <Text
        elementDescriptor={textElementDescriptor}
        elementId={textElementId}
        as='span'
        truncate
        colorScheme='inherit'
        variant='buttonSmallRegular'
      >
        {children}
      </Text>
      <Icon
        elementDescriptor={arrowElementDescriptor}
        elementId={arrowElementId}
        icon={rightIcon}
        sx={[
          theme => ({
            position: 'absolute',
            right: '1rem',
            // color: theme.colors.$blackAlpha500,
            transition: 'all 100ms ease',
            minWidth: theme.sizes.$4,
            minHeight: theme.sizes.$4,
            width: '1em',
            height: '1em',
            opacity: `var(--arrow-opacity)`,
            transform: `var(--arrow-transform)`,
          }),
          rightIconSx,
        ]}
      />
    </Button>
  );
};

// const;
