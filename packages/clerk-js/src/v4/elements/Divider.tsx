import { descriptors, Flex, Text } from '../customizables';

export const Divider = () => {
  return (
    <Flex
      center
      elementDescriptor={descriptors.dividerBox}
    >
      <DividerLine />
      <Text
        elementDescriptor={descriptors.dividerText}
        variant='smallMedium'
        colorScheme='neutral'
        sx={t => ({ margin: `0 ${t.space.$4}` })}
      >
        or
      </Text>
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
