import { Button, Col, Flex, Heading, Icon, RadioInput, Text } from '@/customizables';
import { ChevronRight, DuotoneShieldCheck } from '@/icons';

import { Step } from '../../ConfigureSSO/elements/Step';
import type { PrototypeDeprovisionBehavior } from '../prototype';
import { usePrototype } from '../prototype';

const DEPROVISION_OPTIONS: ReadonlyArray<{
  id: PrototypeDeprovisionBehavior;
  label: string;
  description: string;
}> = [
  {
    id: 'suspend',
    label: 'Suspend membership',
    description: 'Deprovisioned users keep their Clerk account but lose access to this organization.',
  },
  {
    id: 'delete',
    label: 'Remove membership',
    description: 'Deprovisioned users are removed from the organization entirely.',
  },
];

export const ActivateDirectorySyncStep = ({ onExit }: { onExit?: () => void }): JSX.Element => {
  const { deprovisionBehavior, setDeprovisionBehavior, isDirectorySyncActive, setIsDirectorySyncActive } =
    usePrototype();

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
            <Heading textVariant='h2'>
              {isDirectorySyncActive ? 'Directory Sync is active' : 'Directory Sync configured'}
            </Heading>
            <Text
              as='p'
              colorScheme='secondary'
            >
              {isDirectorySyncActive
                ? 'Your identity provider now manages who belongs to this organization.'
                : 'Once activated, your identity provider manages who belongs to this organization — members are added, updated, and removed automatically.'}
            </Text>
          </Col>
        </Col>

        {!isDirectorySyncActive && (
          <Col sx={t => ({ gap: t.space.$2, width: '100%', maxWidth: '24rem', textAlign: 'start' })}>
            <Text
              as='p'
              sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$medium })}
            >
              When a user is deprovisioned:
            </Text>

            {DEPROVISION_OPTIONS.map(option => (
              <Flex
                key={option.id}
                as='label'
                align='start'
                sx={t => ({
                  gap: t.space.$3,
                  padding: t.space.$3,
                  borderRadius: t.radii.$md,
                  borderWidth: t.borderWidths.$normal,
                  borderStyle: t.borderStyles.$solid,
                  borderColor: option.id === deprovisionBehavior ? t.colors.$primary500 : t.colors.$borderAlpha150,
                  cursor: 'pointer',
                })}
              >
                <RadioInput
                  checked={option.id === deprovisionBehavior}
                  onChange={() => setDeprovisionBehavior(option.id)}
                  sx={t => ({ marginTop: t.space.$0x5 })}
                />
                <Col sx={t => ({ gap: t.space.$0x5 })}>
                  <Text
                    as='span'
                    sx={t => ({ fontWeight: t.fontWeights.$medium })}
                  >
                    {option.label}
                  </Text>
                  <Text
                    as='span'
                    colorScheme='secondary'
                    sx={t => ({ fontSize: t.fontSizes.$sm })}
                  >
                    {option.description}
                  </Text>
                </Col>
              </Flex>
            ))}
          </Col>
        )}

        {isDirectorySyncActive ? (
          <Button
            variant='bordered'
            colorScheme='secondary'
            size='sm'
            onClick={() => onExit?.()}
          >
            Done
          </Button>
        ) : (
          <Flex
            align='center'
            gap={4}
          >
            <Button
              variant='solid'
              size='sm'
              onClick={() => setIsDirectorySyncActive(true)}
            >
              Activate Directory Sync
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => onExit?.()}
            >
              <Text as='span'>Skip for now</Text>
              <Icon
                icon={ChevronRight}
                size='sm'
                sx={t => ({ marginInlineStart: t.space.$1 })}
              />
            </Button>
          </Flex>
        )}
      </Step.Section>
    </Step.Body>
  );
};
