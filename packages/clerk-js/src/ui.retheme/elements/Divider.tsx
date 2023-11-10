import { descriptors, Flex, localizationKeys, Text } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';

export const Divider = (props: Omit<PropsOfComponent<typeof Flex>, 'elementDescriptor'>) => {
  return (
    <Flex
      center
      elementDescriptor={descriptors.dividerRow}
      {...props}
    >
      <DividerLine />
      <Text
        localizationKey={localizationKeys('dividerText')}
        elementDescriptor={descriptors.dividerText}
        variant='smallMedium'
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
        backgroundColor: t.colors.$blackAlpha300,
      })}
    />
  );
};
