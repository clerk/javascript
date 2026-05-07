import { Button, descriptors, Flex, Icon, Spinner } from '@/customizables';
import { CaretLeft, CaretRight } from '@/icons';

import { ProfileCardFooter, ProfileCardHeader } from './elements/ProfileCard';
import { Stepper } from './elements/Stepper';

export const ConfigureSSOSkeleton = () => {
  return (
    <>
      <ProfileCardHeader>
        <Stepper.Skeleton totalSteps={4} />
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

      <ProfileCardFooter>
        <Button
          elementDescriptor={descriptors.configureSSOWizardFooterPreviousButton}
          variant='outline'
          size='sm'
          isDisabled
        >
          <Icon
            icon={CaretLeft}
            size='sm'
            sx={theme => ({ marginInlineEnd: theme.space.$1 })}
          />
          Previous
        </Button>

        <Button
          elementDescriptor={descriptors.configureSSOWizardFooterContinueButton}
          variant='solid'
          size='sm'
          isDisabled
        >
          Continue
          <Icon
            icon={CaretRight}
            size='sm'
            sx={theme => ({ marginInlineStart: theme.space.$1 })}
          />
        </Button>
      </ProfileCardFooter>
    </>
  );
};
