import React, { isValidElement } from 'react';

import type { Button, LocalizationKey } from '../customizables';
import { Flex, Icon, SimpleButton, Spinner, Text } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { ArrowRightIcon } from '../icons';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';

type ArrowBlockButtonProps = PropsOfComponent<typeof Button> & {
  rightIcon?: React.ComponentType | null;
  rightIconSx?: ThemableCssProp;
  leftIcon?: React.ComponentType | React.ReactElement;
  leftIconSx?: ThemableCssProp;
  childrenSx?: ThemableCssProp;
  leftIconElementDescriptor?: ElementDescriptor;
  leftIconElementId?: ElementId;
  badge?: React.ReactElement;
  textElementDescriptor?: ElementDescriptor;
  textElementId?: ElementId;
  arrowElementDescriptor?: ElementDescriptor;
  arrowElementId?: ElementId;
  spinnerElementDescriptor?: ElementDescriptor;
  spinnerElementId?: ElementId;
  textLocalizationKey?: LocalizationKey | string;
  textVariant?: PropsOfComponent<typeof Text>['variant'];
};

export const ArrowBlockButton = React.forwardRef<HTMLButtonElement, ArrowBlockButtonProps>((props, ref) => {
  const {
    rightIcon = ArrowRightIcon,
    rightIconSx,
    leftIcon,
    leftIconSx,
    leftIconElementId,
    leftIconElementDescriptor,
    isLoading,
    children,
    textElementDescriptor,
    textElementId,
    spinnerElementDescriptor,
    spinnerElementId,
    arrowElementDescriptor,
    arrowElementId,
    textLocalizationKey,
    childrenSx,
    badge,
    textVariant = 'buttonSmall',
    ...rest
  } = props;

  const isIconElement = isValidElement(leftIcon);

  return (
    <SimpleButton
      variant='outline'
      block
      isLoading={isLoading}
      {...rest}
      ref={ref}
      sx={theme => [
        {
          gap: theme.space.$2,
          position: 'relative',
          justifyContent: 'center',
          borderColor: theme.colors.$neutralAlpha100,
          alignItems: 'center',
          padding: `${theme.space.$1x5} ${theme.space.$3} ${theme.space.$1x5} ${theme.space.$2x5}`,
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
      {(isLoading || leftIcon) && (
        <Flex
          as='span'
          sx={theme => ({ width: theme.space.$4, height: theme.space.$4, flex: 'none', alignItems: 'center' })}
        >
          {isLoading ? (
            <Spinner
              elementDescriptor={spinnerElementDescriptor}
              elementId={spinnerElementId}
              size={'md'}
            />
          ) : !isIconElement && leftIcon ? (
            <Icon
              elementDescriptor={leftIconElementDescriptor}
              elementId={leftIconElementId}
              icon={leftIcon as React.ComponentType}
              sx={[
                theme => ({
                  width: theme.sizes.$4,
                  // Fixes a bug in Safari where the icon shifts when navigating between routes.
                  transform: 'translateZ(0)',
                }),
                leftIconSx,
              ]}
            />
          ) : (
            leftIcon
          )}
        </Flex>
      )}
      <Flex
        gap={2}
        as='span'
        sx={[
          {
            overflow: 'hidden',
          },
          childrenSx,
        ]}
      >
        <Text
          elementDescriptor={textElementDescriptor}
          elementId={textElementId}
          as='span'
          truncate
          variant={textVariant}
          localizationKey={textLocalizationKey}
        >
          {children}
        </Text>
        {badge}
      </Flex>
      {rightIcon && (
        <Icon
          elementDescriptor={arrowElementDescriptor}
          elementId={arrowElementId}
          icon={rightIcon}
          sx={[
            theme => ({
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
      )}
    </SimpleButton>
  );
});
