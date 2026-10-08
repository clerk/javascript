import { MfaBackupCodeList } from '@/components/UserProfile/MfaBackupCodeList';
import { localizationKeys } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { SuccessPage } from '@/ui/elements/SuccessPage';

export const SmsSuccessView = ({ backupCodes, onFinish }: { backupCodes?: string[]; onFinish: () => void }) => (
  <Card.Content>
    <SuccessPage
      title={localizationKeys('taskSetupMfa.smsCode.success.title')}
      subtitle={localizationKeys('taskSetupMfa.smsCode.success.message1')}
      headerBadgeText={localizationKeys('taskSetupMfa.badge')}
      onFinish={onFinish}
      contents={
        <MfaBackupCodeList
          backupCodes={backupCodes}
          subtitle={localizationKeys('taskSetupMfa.smsCode.success.message2')}
        />
      }
      finishLabel={localizationKeys('taskSetupMfa.smsCode.success.finishButton')}
      finishButtonProps={{
        block: true,
        hasArrow: true,
      }}
    />
  </Card.Content>
);
