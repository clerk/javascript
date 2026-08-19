import { Box, Col, Flex, Icon, RadioInput, Text } from '../../../customizables';
import { Lock } from '../../../icons';
import { common } from '../../../styledSystem';
import type { ProtoDomain, ProtoEnrollment } from './prototypeState';
import { ENROLLMENT_LABELS, hasOwnership } from './prototypeState';

type EnrollmentOption = {
  value: ProtoEnrollment;
  isLocked: boolean;
  lockedReason?: string;
};

/*
 * The proof-gating matrix, rendered. For a self-serve admin: affiliation
 * (email round-trip) unlocks the low-risk modes; ownership (DNS TXT) is
 * required for anything that touches sign-in, like joining automatically.
 * Locked options stay visible with the reason — the gate is the product.
 */
const optionsFor = (domain: ProtoDomain): EnrollmentOption[] => [
  {
    value: 'invitation_only',
    isLocked: !domain.affiliationVerified,
    lockedReason: 'Verify the domain to enable',
  },
  {
    value: 'request_access',
    isLocked: !domain.affiliationVerified,
    lockedReason: 'Verify the domain to enable',
  },
  {
    value: 'join_automatically',
    isLocked: !hasOwnership(domain),
    lockedReason: 'Verify ownership to enable',
  },
  {
    value: 'directory_synced',
    isLocked: true,
    lockedReason: 'Coming soon',
  },
];

type EnrollmentOptionsProps = {
  domain: ProtoDomain;
  value: ProtoEnrollment;
  onChange: (enrollment: ProtoEnrollment) => void;
};

export const EnrollmentOptions = ({ domain, value, onChange }: EnrollmentOptionsProps) => {
  return (
    <Col
      role='radiogroup'
      aria-label='Enrollment'
      sx={t => ({ gap: t.space.$2 })}
    >
      {optionsFor(domain).map(option => {
        const { label, description } = ENROLLMENT_LABELS[option.value];
        const isChecked = value === option.value;
        return (
          <Box
            key={option.value}
            as='label'
            isActive={isChecked}
            sx={t => ({
              display: 'flex',
              alignItems: 'flex-start',
              gap: t.space.$3,
              padding: t.space.$3,
              cursor: option.isLocked ? 'not-allowed' : 'pointer',
              opacity: option.isLocked ? 0.6 : 1,
              ...common.borderVariants(t).normal,
              '&:has(input:focus-visible)': {
                ...common.focusRingStyles(t),
                borderColor: t.colors.$borderAlpha300,
              },
              '&:has(input:checked)': {
                backgroundColor: t.colors.$neutralAlpha50,
              },
            })}
          >
            <RadioInput
              name='protoEnrollment'
              value={option.value}
              checked={isChecked}
              isDisabled={option.isLocked}
              onChange={() => onChange(option.value)}
              sx={t => ({ marginTop: t.space.$0x5 })}
            />
            <Col sx={t => ({ gap: t.space.$0x5, minWidth: 0 })}>
              <Flex
                align='center'
                sx={t => ({ gap: t.space.$1x5 })}
              >
                <Text
                  as='span'
                  variant='subtitle'
                >
                  {label}
                </Text>
                {option.isLocked ? (
                  <Icon
                    icon={Lock}
                    size='sm'
                    colorScheme='neutral'
                  />
                ) : null}
              </Flex>
              <Text
                as='span'
                colorScheme='secondary'
                sx={t => ({ fontSize: t.fontSizes.$sm })}
              >
                {description}
              </Text>
              {option.isLocked && option.lockedReason ? (
                <Text
                  as='span'
                  colorScheme='secondary'
                  sx={t => ({ fontSize: t.fontSizes.$sm, fontStyle: 'italic' })}
                >
                  {option.lockedReason}
                </Text>
              ) : null}
            </Col>
          </Box>
        );
      })}
    </Col>
  );
};
