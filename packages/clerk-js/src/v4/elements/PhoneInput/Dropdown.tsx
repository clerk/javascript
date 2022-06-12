import React from 'react';

import { Flex, Icon } from '../../customizables';
import { MagnifyingGlass } from '../../icons';
import { animations, PropsOfComponent } from '../../styledSystem';
import { InputWithIcon } from '../InputWithIcon';

type DropdownBoxProps = PropsOfComponent<typeof Flex> & { isOpen: boolean };

export const DropdownBox = React.forwardRef<HTMLDivElement, DropdownBoxProps>((props, ref) => {
  const { isOpen, ...rest } = props;
  if (!isOpen) {
    return null;
  }

  return (
    <Flex
      ref={ref}
      direction='col'
      justify='start'
      sx={theme => ({
        backgroundColor: theme.colors.$background500,
        border: theme.borders.$normal,
        borderRadius: theme.radii.$lg,
        borderColor: theme.colors.$whiteAlpha200,
        overflow: 'hidden',
        width: '100%',
        top: `calc(100% + ${theme.space.$2})`,
        animation: `${animations.dropdownFadeInAndScale} 250ms`,
        animationTimingFunction: theme.transitionTiming.$slowBezier,
        transformOrigin: 'top center',
        boxShadow: theme.shadows.$cardDropShadow,
        zIndex: 10,
      })}
      {...rest}
    />
  );
});

export const DropdownSearchbar = (props: PropsOfComponent<typeof InputWithIcon>) => {
  // @ts-expect-error
  React.useEffect(() => () => props.onChange({ target: { value: '' } }), []);

  return (
    <Flex sx={theme => ({ borderBottom: theme.borders.$normal, borderColor: theme.colors.$blackAlpha200 })}>
      <InputWithIcon
        focusRing={false}
        autoFocus
        leftIcon={
          <Icon
            colorScheme='gray'
            icon={MagnifyingGlass}
          />
        }
        sx={{ border: 'none' }}
        {...props}
      />
    </Flex>
  );
};

export const DropdownItemContainer = (props: React.PropsWithChildren<any>) => {
  return (
    <Flex
      direction='col'
      sx={theme => ({ overflowY: 'scroll', maxHeight: '15vh', paddingBottom: theme.space.$2 })}
      {...props}
    />
  );
};

export const DropdownItem = React.forwardRef((props: React.PropsWithChildren<any>, ref: any) => {
  return (
    <Flex
      ref={ref}
      justify='center'
      align='center'
      sx={theme => ({ padding: `${theme.space.$2} ${theme.space.$4}` })}
      {...props}
    />
  );
});
