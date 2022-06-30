import React from 'react';

import { Button, Icon, Spinner, Text } from '../customizables';
import { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { ArrowRightIcon } from '../icons';
import { PropsOfComponent, ThemableCssProp } from '../styledSystem';

type ArrowBlockButtonProps = PropsOfComponent<typeof Button> & {
  icon?: React.ReactElement;
  textElementDescriptor?: ElementDescriptor;
  textElementId?: ElementId;
  arrowElementDescriptor?: ElementDescriptor;
  arrowElementId?: ElementId;
  spinnerElementDescriptor?: ElementDescriptor;
  spinnerElementId?: ElementId;
};

export const ArrowBlockButton = (props: ArrowBlockButtonProps) => {
  const {
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

  const leftIcon = icon
    ? React.cloneElement(icon, {
        sx: [
          icon.props.sx,
          theme => ({ width: theme.sizes.$4, margin: `-${theme.space.$px} ${theme.space.$4} -${theme.space.$px} 0` }),
        ],
      })
    : null;

  return (
    <Button
      variant='outline'
      colorScheme='neutral'
      textVariant='smallRegular'
      block
      sx={theme => ({
        position: 'relative',
        justifyContent: 'flex-start',
        color: theme.colors.$colorText,
        borderColor: theme.colors.$blackAlpha200,
        '--arrow-opacity': '0',
        '--arrow-transform': `translateX(-${theme.space.$2});`,
        '&:hover,&:focus ': {
          '--arrow-opacity': '1',
          '--arrow-transform': 'translateX(0px);',
        },
      })}
      {...rest}
    >
      {isLoading ? (
        <Spinner
          elementDescriptor={spinnerElementDescriptor}
          elementId={spinnerElementId}
          sx={theme => ({ marginRight: theme.space.$4 })}
        />
      ) : (
        leftIcon
      )}
      <Text
        elementDescriptor={textElementDescriptor}
        elementId={textElementId}
        as='span'
        truncate
      >
        {children}
      </Text>
      <Icon
        elementDescriptor={arrowElementDescriptor}
        elementId={arrowElementId}
        icon={ArrowRightIcon}
        sx={theme => ({
          position: 'absolute',
          right: '1rem',
          color: theme.colors.$blackAlpha500,
          transition: 'all 100ms ease',
          minWidth: theme.sizes.$4,
          minHeight: theme.sizes.$4,
          width: '1em',
          height: '1em',
          opacity: `var(--arrow-opacity)`,
          transform: `var(--arrow-transform)`,
        })}
      />
    </Button>
  );
};
