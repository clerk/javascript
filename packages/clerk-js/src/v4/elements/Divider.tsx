import { descriptors, Flex } from '../customizables';

export const Divider = () => {
  return (
    <Flex
      elementDescriptor={descriptors.divider}
      sx={theme => ({
        width: '100%',
        height: '1px',
        backgroundColor: theme.colors.$blackAlpha300,
        display: 'none',
      })}
    />
  );
};
