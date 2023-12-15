import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, localizationKeys, Text } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';

type DividerProps = Omit<PropsOfComponent<typeof Flex>, 'elementDescriptor'> & {
  deviderText?: LocalizationKey;
};

export const Divider = (props: DividerProps) => {
  return (
    <Flex
      center
      elementDescriptor={descriptors.dividerRow}
      {...props}
    >
      <DividerLine />
      <Text
        localizationKey={!props.deviderText ? localizationKeys('dividerText') : props.deviderText}
        elementDescriptor={descriptors.dividerText}
        variant='subtitle'
        colorScheme='neutral'
        sx={t => ({ margin: `0 ${t.space.$4}` })}
      />
      <DividerLine />
    </Flex>
  );
};

const DividerLine = () => {
  return (
    <Flex
      elementDescriptor={descriptors.dividerLine}
      sx={t => ({
        flex: '1',
        height: '1px',
        backgroundColor: t.colors.$blackAlpha200,
      })}
    />
  );
};
