import React from 'react';

import { useNavigate } from '../../ui/hooks';
import { Badge, Col, Icon } from '../customizables';
import { AuthApp } from '../icons';
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
          title={'Default factor'}
          subtitle='This factor will be used as the default two-step verification method when signing in.'
        />

        <LinkButtonWithDescription
          title='Remove'
          subtitle='Remove authenticator application from the two-step verification methods'
          actionLabel='Remove authenticator application'
          colorScheme='danger'
          onClick={() => navigate(`multi-factor/totp/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};
