import { descriptors, Flex, Spinner } from '../customizables';

export const FullHeightLoader = (): JSX.Element => {
  return (
    <Flex
      center
      sx={{ height: '100%' }}
    >
      <Spinner
        colorScheme='primary'
        size='lg'
        elementDescriptor={descriptors.spinner}
      />
    </Flex>
  );
};
