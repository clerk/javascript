import { Col, Icon, localizationKeys, useLocalizations } from '../../customizables';
import { useNavigate } from '../../hooks';
import { DotCircle } from '../../icons';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { UserProfileAccordion } from './UserProfileAccordion';

export const MfaBackupCodeAccordion = () => {
  const { navigate } = useNavigate();
  const { t } = useLocalizations();

  return (
    <UserProfileAccordion
      icon={
        <Icon
          icon={DotCircle}
          sx={theme => ({ color: theme.colors.$blackAlpha700 })}
        />
      }
      title={t(localizationKeys('userProfile.start.mfaSection.backupCodes.headerTitle'))}
    >
      <Col gap={4}>
        <LinkButtonWithDescription
          title={localizationKeys('userProfile.start.mfaSection.backupCodes.title__regenerate')}
          subtitle={localizationKeys('userProfile.start.mfaSection.backupCodes.subtitle__regenerate')}
          actionLabel={localizationKeys('userProfile.start.mfaSection.backupCodes.actionLabel__regenerate')}
          onClick={() => navigate('multi-factor/backup_code/add')}
        />
      </Col>
    </UserProfileAccordion>
  );
};
