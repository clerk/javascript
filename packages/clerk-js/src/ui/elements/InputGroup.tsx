import { forwardRef } from 'react';

import { descriptors, Flex, Input, Text } from '../customizables';
import { common, type PropsOfComponent, type ThemableCssProp } from '../styledSystem';

type InputGroupProps = PropsOfComponent<typeof Input>;

export const InputGroup = forwardRef<
  HTMLInputElement,
  InputGroupProps & {
    groupPrefix?: string;
    groupSuffix?: string;
  }
>((props, ref) => {
  const { sx, groupPrefix, groupSuffix, ...rest } = props;

  const inputBorder = groupPrefix
    ? {
        borderTopLeftRadius: '0',
        borderBottomLeftRadius: '0',
      }
    : {
        borderTopRightRadius: '0',
        borderBottomRightRadius: '0',
      };

  const textProps: ThemableCssProp = t => ({
    paddingInline: t.space.$2,
    borderTopRightRadius: '0',
    borderBottomRightRadius: '0',
    width: 'fit-content',
    display: 'flex',
    alignItems: 'center',
  });

  return (
    <Flex
      elementDescriptor={descriptors.formInputGroup}
      direction='row'
      hasError={rest.hasError}
      sx={theme => ({
        position: 'relative',
        zIndex: 1,
        ...common.borderVariants(theme).normal,
        ':focus-within': {
          ...common.borderVariants(theme, {
            focusRignt: true,
          }).normal['&:focus'],
        },
      })}
    >
      {groupPrefix && (
        <Text
          colorScheme='secondary'
          sx={textProps}
        >
          {groupPrefix}
        </Text>
      )}
      <Input
        maxLength={25}
        sx={[
          {
            ...inputBorder,
          },
          sx,
        ]}
        variant='unstyled'
        ref={ref}
        {...rest}
      />
      {groupSuffix && (
        <Text
          colorScheme='secondary'
          sx={textProps}
        >
          {groupSuffix}
        </Text>
      )}
    </Flex>
  );
});
