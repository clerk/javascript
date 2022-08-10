import { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { Badge, Col, Icon } from '../customizables';
import { FormattedPhoneNumberText, useCardState } from '../elements';
import { useNavigate } from '../hooks';
import { Mobile } from '../icons';
import { handleError } from '../utils';
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
            title={isDefault ? 'Default factor' : 'Set as Default factor'}
            subtitle={
              isDefault
                ? 'This factor will be used as the default two-step verification method when signing in.'
                : 'Set this factor as the default factor to use it as the default two-step verification method when signing in.'
            }
            actionLabel={!isDefault ? 'Set as default' : undefined}
            onClick={() => phone.makeDefaultSecondFactor().catch(err => handleError(err, [], card.setError))}
          />
        )}

        <LinkButtonWithDescription
          title='Remove'
          subtitle='Remove this phone number from the two-step verification methods'
          actionLabel='Remove phone number'
          colorScheme='danger'
          onClick={() => navigate(`multi-factor/${phone.id}/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};
