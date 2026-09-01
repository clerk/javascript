import { Button, Col, Flex, Heading, Icon, Text } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { ChevronRight, DuotoneShieldCheck } from '@/icons';
import { Alert } from '@/ui/elements/Alert';
import { handleError } from '@/utils/errorHandler';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useConfigureDirectorySync } from '../ConfigureDirectorySyncContext';

export const ActivateDirectorySyncStep = (): JSX.Element => {
  const { directory, setDirectoryEnabled, onExit } = useConfigureDirectorySync();
  const card = useCardState();

  const isActive = directory?.enabled ?? false;

  const handleActivate = async (): Promise<void> => {
    if (!directory || card.isLoading) {
      return;
    }

    card.setError(undefined);
    card.setLoading();
    try {
      await setDirectoryEnabled(true);
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <Step.Body>
      <Step.Section
        fill
        gap={5}
        sx={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <Col
          align='center'
          sx={t => ({ textAlign: 'center', maxWidth: '24rem', gap: t.space.$3x5 })}
        >
          <Icon
            icon={DuotoneShieldCheck}
            colorScheme='neutral'
            sx={t => ({ width: t.sizes.$8, height: t.sizes.$8 })}
          />

          <Col
            align='center'
            gap={2}
          >
            <Heading textVariant='h2'>{isActive ? 'Directory Sync is active' : 'Directory Sync configured'}</Heading>
            <Text
              as='p'
              colorScheme='secondary'
            >
              {isActive
                ? 'Your identity provider now manages who belongs to this organization.'
                : 'Once activated, your identity provider manages who belongs to this organization — members are added, updated, and removed automatically.'}
            </Text>
          </Col>

          {!isActive && (
            <Text
              as='p'
              colorScheme='secondary'
              sx={t => ({ fontSize: t.fontSizes.$sm })}
            >
              When your identity provider deprovisions a user, they keep their Clerk account but are signed out of all
              sessions and lose access.
            </Text>
          )}

          {card.error && (
            <Alert
              variant='danger'
              sx={{ width: '100%' }}
              title={card.error}
            />
          )}
        </Col>

        {isActive ? (
          // Exit-only: without a host-supplied onExit (the standalone mount) there is nowhere to go.
          onExit && (
            <Button
              variant='bordered'
              colorScheme='secondary'
              size='sm'
              onClick={onExit}
            >
              Done
            </Button>
          )
        ) : (
          <Flex
            align='center'
            gap={4}
          >
            <Button
              variant='solid'
              size='sm'
              isLoading={card.isLoading}
              onClick={() => void handleActivate()}
            >
              Activate Directory Sync
            </Button>

            {onExit && (
              <Button
                variant='outline'
                size='sm'
                isDisabled={card.isLoading}
                onClick={onExit}
              >
                <Text as='span'>Skip for now</Text>
                <Icon
                  icon={ChevronRight}
                  size='sm'
                  sx={t => ({ marginInlineStart: t.space.$1 })}
                />
              </Button>
            )}
          </Flex>
        )}
      </Step.Section>
    </Step.Body>
  );
};
