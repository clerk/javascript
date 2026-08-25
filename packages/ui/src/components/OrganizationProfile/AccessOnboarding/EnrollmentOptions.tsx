import { Badge, Box, Col, Flex, Icon, RadioInput, Text } from '../../../customizables';
import { Lock } from '../../../icons';
import { common } from '../../../styledSystem';
import type { ProtoDomain, ProtoEnrollment } from './prototypeState';
import { ENROLLMENT_LABELS, hasOwnership, recommendedEnrollmentFor } from './prototypeState';

type EnrollmentOption = {
  value: ProtoEnrollment;
  isLocked: boolean;
  lockedReason?: string;
};

/*
 * Ordering tracks the sign-in answer, mirroring the dashboard wizard: with
 * SSO, directory sync sits beside "Join automatically" (the two hands-off
 * modes read as neighbors); with default sign-in it sinks to the end,
 * locked with the reason. Invitation-only is last either way.
 *
 * The proof-gating matrix overlays that order. For a self-serve admin:
 * affiliation (email round-trip) unlocks the low-risk modes; ownership
 * (DNS TXT) is required for anything that touches sign-in, like joining
 * automatically. Locked options stay visible with the reason — the gate is
 * the product. Directory sync additionally needs the domain's single
 * sign-on to be active; the SCIM setup flow itself is a follow-up (the
 * option ships the model's shape first).
 */
const optionsFor = (domain: ProtoDomain, signInMode: 'default' | 'sso'): EnrollmentOption[] => {
  const joinAutomatically: EnrollmentOption = {
    value: 'join_automatically',
    isLocked: !hasOwnership(domain),
    lockedReason: 'Verify ownership to enable',
  };
  const requestAccess: EnrollmentOption = {
    value: 'request_access',
    isLocked: !domain.affiliationVerified,
    lockedReason: 'Verify the domain to enable',
  };
  const invitationOnly: EnrollmentOption = {
    value: 'invitation_only',
    isLocked: !domain.affiliationVerified,
    lockedReason: 'Verify the domain to enable',
  };
  const ssoActive = domain.authentication.mode === 'sso' && domain.authentication.status === 'active';
  const directory: EnrollmentOption = {
    value: 'directory_synced',
    isLocked: !ssoActive,
    lockedReason: signInMode === 'sso' ? 'Available once single sign-on is active' : 'Needs single sign-on',
  };

  return signInMode === 'sso'
    ? [joinAutomatically, directory, requestAccess, invitationOnly]
    : [joinAutomatically, requestAccess, invitationOnly, directory];
};

type EnrollmentOptionsProps = {
  domain: ProtoDomain;
  value: ProtoEnrollment;
  onChange: (enrollment: ProtoEnrollment) => void;
  /** How this rule signs people in — drives ordering and the recommendation. */
  signInMode: 'default' | 'sso';
};

export const EnrollmentOptions = ({ domain, value, onChange, signInMode }: EnrollmentOptionsProps) => {
  const recommended = recommendedEnrollmentFor(signInMode);
  return (
    <Col
      role='radiogroup'
      aria-label='Enrollment'
      sx={t => ({ gap: t.space.$2 })}
    >
      {optionsFor(domain, signInMode).map(option => {
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
                {option.value === recommended && !option.isLocked ? (
                  <Badge colorScheme='primary'>Recommended</Badge>
                ) : null}
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
