import { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { Badge, Col, Icon, localizationKeys } from '../../customizables';
import { FormattedPhoneNumberText, useCardState } from '../../elements';
import { useNavigate } from '../../hooks';
import { Mobile } from '../../icons';
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
  const { navigate } = useNavigate();
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
      badge={isDefault ? <Badge>Default</Badge> : undefined}
    >
      <Col gap={4}>
        {!showTOTP && (
          <LinkButtonWithDescription
            title={localizationKeys(
              `userProfile.start.phoneNumbersSection.defaultFactorTitle__${isDefault ? 'default' : 'setDefault'}`,
            )}
            subtitle={localizationKeys(
              `userProfile.start.phoneNumbersSection.defaultFactorSubtitle__${isDefault ? 'default' : 'setDefault'}`,
            )}
            actionLabel={
              !isDefault
                ? localizationKeys('userProfile.start.phoneNumbersSection.defaultFactorActionLabel__setDefault')
                : undefined
            }
            onClick={() => phone.makeDefaultSecondFactor().catch(err => handleError(err, [], card.setError))}
          />
        )}

        <LinkButtonWithDescription
          title={localizationKeys('userProfile.start.phoneNumbersSection.destructiveActionTitle')}
          subtitle={localizationKeys('userProfile.start.phoneNumbersSection.destructiveActionAccordionSubtitle')}
          actionLabel={localizationKeys('userProfile.start.phoneNumbersSection.destructiveAction')}
          colorScheme='danger'
          onClick={() => navigate(`multi-factor/${phone.id}/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};
