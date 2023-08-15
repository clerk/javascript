import { forwardRef } from 'react';

import { descriptors, Flex, Input, Text } from '../customizables';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';

type InputGroupProps = PropsOfComponent<typeof Input>;

export const InputGroup = forwardRef<
  HTMLInputElement,
  InputGroupProps & {
    groupPreffix?: string;
    groupSuffix?: string;
  }
>((props, ref) => {
  const { sx, groupPreffix, groupSuffix, ...rest } = props;

  const inputBorder = groupPreffix
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
    backgroundColor: t.colors.$blackAlpha50,
    borderTopRightRadius: '0',
    borderBottomRightRadius: '0',
    width: 'fit-content',
    display: 'flex',
    alignItems: 'center',
  });

  return (
    <Flex
      // TODO: update this.
      elementDescriptor={descriptors.phoneInputBox}
      direction='row'
      hasError={rest.hasError}
      sx={theme => ({
        position: 'relative',
        borderRadius: theme.radii.$md,
        zIndex: 1,
        border: theme.borders.$normal,
        borderColor: theme.colors.$blackAlpha300, // we use this value in the Input primitive
      })}
    >
      {groupPreffix && <Text sx={textProps}>{groupPreffix}</Text>}
      <Input
        maxLength={25}
        sx={[
          {
            borderColor: 'transparent',
            height: '100%',
            ...inputBorder,
          },
          sx,
        ]}
        ref={ref}
        {...rest}
      />
      {groupSuffix && (
        <Text
          colorScheme='neutral'
          sx={textProps}
        >
          {groupSuffix}
        </Text>
      )}
    </Flex>
  );
});
