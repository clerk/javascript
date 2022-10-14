import React from 'react';

import { Col, Icon, localizationKeys } from '../../customizables';
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
          title={localizationKeys('userProfile.start.backupCode2FaSection.regenerateTitle')}
          subtitle={localizationKeys('userProfile.start.backupCode2FaSection.regenerateSubtitle')}
          actionLabel={localizationKeys('userProfile.start.backupCode2FaSection.regenerateActionLabel')}
          onClick={() => navigate('multi-factor/backup_code/add')}
        />
      </Col>
    </UserProfileAccordion>
  );
};
