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
      title={localizationKeys('userProfile.start.mfaSection.totp.headerTitle')}
      badge={<Badge localizationKey={localizationKeys('badge__default')} />}
    >
      <Col gap={4}>
        <LinkButtonWithDescription
          title={localizationKeys('userProfile.start.mfaSection.totp.title')}
          subtitle={localizationKeys('userProfile.start.mfaSection.totp.subtitle')}
        />

        <LinkButtonWithDescription
          title={localizationKeys('userProfile.start.mfaSection.totp.destructiveActionTitle')}
          subtitle={localizationKeys('userProfile.start.mfaSection.totp.destructiveActionSubtitle')}
          actionLabel={localizationKeys('userProfile.start.mfaSection.totp.destructiveActionLabel')}
          colorScheme='danger'
          onClick={() => navigate(`multi-factor/totp/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};
