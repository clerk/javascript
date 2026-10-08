import { Button, descriptors, Icon, localizationKeys, Spinner, Text } from '@/customizables';
import { Link as LinkIcon } from '@/icons';

import type { useOpenTestUrlButtonController } from './open-test-url-button.controller';

export const OpenTestUrlButtonView = ({
  isCreatingTestRun,
  openTestRun,
}: ReturnType<typeof useOpenTestUrlButtonController>): JSX.Element => {
  return (
    <Button
      elementDescriptor={descriptors.configureSSOTestUrlOpenButton}
      id='testSsoUrl'
      variant='bordered'
      colorScheme='secondary'
      size='xs'
      onClick={openTestRun}
      isDisabled={isCreatingTestRun}
      sx={t => ({ gap: t.space.$1x5, width: 'fit-content' })}
    >
      {isCreatingTestRun ? (
        <Spinner
          elementDescriptor={descriptors.spinner}
          size='sm'
        />
      ) : (
        <Icon
          icon={LinkIcon}
          size='sm'
          colorScheme='neutral'
        />
      )}
      <Text
        as='span'
        localizationKey={localizationKeys('configureSSO.testConfigurationStep.testUrl.actionLabel__open')}
      />
    </Button>
  );
};
