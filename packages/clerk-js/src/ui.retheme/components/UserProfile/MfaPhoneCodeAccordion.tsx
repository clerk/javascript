import type { PhoneNumberResource } from '@clerk/types';

import { Badge, Col, Icon, localizationKeys } from '../../customizables';
import { FormattedPhoneNumberText, useCardState } from '../../elements';
import { Mobile } from '../../icons';
import { useRouter } from '../../router';
import { handleError } from '../../utils';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { UserProfileAccordion } from './UserProfileAccordion';

// TODO(MFA): Until we implement 'Set default' across MFA factors,
//  we allow toggling the default status of a phone only if TOTP is not enabled

type MfaPhoneCodeAccordionProps = {
  phone: PhoneNumberResource;
  showTOTP: boolean;
};

export const MfaPhoneCodeAccordion = ({ phone, showTOTP }: MfaPhoneCodeAccordionProps) => {
  const { navigate } = useRouter();
  const card = useCardState();

  const isDefault = !showTOTP && phone.defaultSecondFactor;

  return (
    <UserProfileAccordion
      icon={
        <Icon
          icon={Mobile}
          sx={theme => ({ color: theme.colors.$blackAlpha700 })}
        />
      }
      title={
        <>
          SMS Code <FormattedPhoneNumberText value={phone.phoneNumber} />
        </>
      }
      badge={isDefault ? <Badge localizationKey={localizationKeys('badge__default')} /> : undefined}
    >
      <Col gap={4}>
        {!showTOTP && (
          <LinkButtonWithDescription
            title={localizationKeys(
              isDefault
                ? 'userProfile.start.mfaSection.phoneCode.title__default'
                : 'userProfile.start.mfaSection.phoneCode.title__setDefault',
            )}
            subtitle={localizationKeys(
              isDefault
                ? 'userProfile.start.mfaSection.phoneCode.subtitle__default'
                : 'userProfile.start.mfaSection.phoneCode.subtitle__setDefault',
            )}
            actionLabel={
              !isDefault
                ? localizationKeys('userProfile.start.mfaSection.phoneCode.actionLabel__setDefault')
                : undefined
            }
            onClick={() => phone.makeDefaultSecondFactor().catch(err => handleError(err, [], card.setError))}
          />
        )}

        <LinkButtonWithDescription
          title={localizationKeys('userProfile.start.mfaSection.phoneCode.destructiveActionTitle')}
          subtitle={localizationKeys('userProfile.start.mfaSection.phoneCode.destructiveActionSubtitle')}
          actionLabel={localizationKeys('userProfile.start.mfaSection.phoneCode.destructiveActionLabel')}
          variant='linkDanger'
          onClick={() => navigate(`multi-factor/${phone.id}/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};
