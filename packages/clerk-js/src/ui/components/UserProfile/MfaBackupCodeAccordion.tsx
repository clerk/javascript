import React from 'react';

import { Col, Icon } from '../../customizables';
import { useNavigate } from '../../hooks';
import { DotCircle } from '../../icons';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { UserProfileAccordion } from './UserProfileAccordion';

export const MfaBackupCodeAccordion = () => {
  const { navigate } = useNavigate();

  return (
    <UserProfileAccordion
      icon={
        <Icon
          icon={DotCircle}
          sx={theme => ({ color: theme.colors.$blackAlpha700 })}
        />
      }
      title='Backup codes'
    >
      <Col gap={4}>
        <LinkButtonWithDescription
          title='Regenerate backup codes'
          subtitle='Get a fresh set of secure backup codes. Prior backup codes will be deleted and cannot be used.'
          actionLabel='Regenerate codes'
          onClick={() => navigate('multi-factor/backup_code/add')}
        />
      </Col>
    </UserProfileAccordion>
  );
};
