import React from 'react';

import { Badge, Col, Icon, localizationKeys } from '../../customizables';
import { useNavigate } from '../../hooks';
import { AuthApp } from '../../icons';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { UserProfileAccordion } from './UserProfileAccordion';

// TODO(MFA): Until we implement 'Set default' across MFA factors, we treat TOTP as the default, if enabled

export const MfaTOTPAccordion = () => {
  const { navigate } = useNavigate();

  return (
    <UserProfileAccordion
      icon={
        <Icon
          icon={AuthApp}
          sx={theme => ({ color: theme.colors.$blackAlpha700 })}
        />
      }
      title='Authenticator application'
      badge={<Badge>Default</Badge>}
    >
      <Col gap={4}>
        <LinkButtonWithDescription
          title={localizationKeys('userProfile.mfaTOTPPage.defaultFactorTitle')}
          subtitle={localizationKeys('userProfile.mfaTOTPPage.defaultFactorSubtitle')}
        />

        <LinkButtonWithDescription
          title={localizationKeys('userProfile.mfaTOTPPage.removeFactorTitle')}
          subtitle={localizationKeys('userProfile.mfaTOTPPage.removeFactorSubtitle')}
          actionLabel={localizationKeys('userProfile.mfaTOTPPage.removeFactorActionLabel')}
          colorScheme='danger'
          onClick={() => navigate(`multi-factor/totp/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};
