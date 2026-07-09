import { descriptors, Flex, Spinner } from '@/customizables';

import { ProfileCardHeader } from './elements/ProfileCard';
import { Step } from './elements/Step';
import { Stepper } from './elements/Stepper';

export const ConfigureSSOSkeleton = () => {
  return (
    <>
      <ProfileCardHeader>
        <Stepper.Skeleton />
      </ProfileCardHeader>

      <Flex
        align='center'
        justify='center'
        sx={theme => ({
          flex: 1,
          padding: theme.space.$5,
        })}
      >
        <Spinner
          size='xs'
          colorScheme='neutral'
          elementDescriptor={descriptors.spinner}
        />
      </Flex>

      <Step.Footer>
        <Step.Footer.Previous isDisabled />
        <Step.Footer.Continue isDisabled />
      </Step.Footer>
    </>
  );
};
