import React from 'react';

import { Flex, Icon } from '../../customizables';
import { MagnifyingGlass } from '../../icons';
import { animations, PropsOfComponent } from '../../styledSystem';
import { colors } from '../../utils';
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
        backgroundColor: colors.makeSolid(theme.colors.$colorBackground),
        border: theme.borders.$normal,
        borderRadius: theme.radii.$lg,
        borderColor: theme.colors.$blackAlpha200,
        overflow: 'hidden',
        width: '100%',
        top: `calc(100% + ${theme.space.$2})`,
        animation: `${animations.dropdownSlideInScaleAndFade} 250ms ${theme.transitionTiming.$slowBezier}`,
        transformOrigin: 'top center',
        boxShadow: theme.shadows.$cardDropShadow,
        zIndex: 10,
      })}
      {...rest}
    />
  );
});

export const DropdownSearchbar = (props: PropsOfComponent<typeof InputWithIcon>) => {
  React.useEffect(() => {
    // @ts-expect-error
    return () => props.onChange({ target: { value: '' } });
  }, []);

  return (
    <Flex sx={theme => ({ borderBottom: theme.borders.$normal, borderColor: theme.colors.$blackAlpha200 })}>
      <InputWithIcon
        focusRing={false}
        autoFocus
        leftIcon={
          <Icon
            colorScheme='neutral'
            icon={MagnifyingGlass}
          />
        }
        sx={{ border: 'none', borderRadius: '0' }}
        {...props}
      />
    </Flex>
  );
};

export const DropdownItemContainer = (props: React.PropsWithChildren<any>) => {
  return (
    <Flex
      direction='col'
      sx={theme => ({
        overflowY: 'scroll',
        maxHeight: '18vh',
        paddingBottom: theme.space.$2,
      })}
      {...props}
    />
  );
};
