import type { PhoneNumberResource } from '@clerk/shared/types';

import {
  useMfaAddMenuController,
  useMfaMenuController,
  useMfaPhoneCodeController,
  useMfaSectionController,
} from './mfa-section.controller';
import { useMfaPhoneCodeModel, useMfaSectionModel } from './mfa-section.model';
import { MfaAddMenuView, MfaPhoneCodeView, MfaSectionView, MfaSimpleMenuView } from './mfa-section.view';
import { MfaBackupCodeCreateScreen, MfaScreen, RemoveMfaPhoneCodeScreen, RemoveMfaTOTPScreen } from './MfaScreens';

const MfaTOTPMenu = () => {
  const controller = useMfaMenuController(
    'remove-totp',
    'userProfile.start.mfaSection.totp.destructiveActionTitle',
    true,
  );
  return <MfaSimpleMenuView controller={controller} />;
};

const MfaBackupCodeMenu = () => {
  const controller = useMfaMenuController(
    'regenerate',
    'userProfile.start.mfaSection.backupCodes.actionLabel__regenerate',
  );
  return <MfaSimpleMenuView controller={controller} />;
};

const MfaPhoneCode = ({
  phone,
  showTOTP,
  hidePhoneCodeDeleteAction,
}: {
  phone: PhoneNumberResource;
  showTOTP: boolean;
  hidePhoneCodeDeleteAction: boolean;
}) => {
  const model = useMfaPhoneCodeModel(phone, showTOTP, hidePhoneCodeDeleteAction);
  const controller = useMfaPhoneCodeController(model);

  return (
    <MfaPhoneCodeView
      controller={controller}
      removeScreen={<RemoveMfaPhoneCodeScreen phoneId={controller.id} />}
    />
  );
};

const MfaAddMenu = ({ strategies, closeAction }: { strategies: string[]; closeAction: () => void }) => {
  const controller = useMfaAddMenuController();

  return (
    <MfaAddMenuView
      controller={controller}
      strategies={strategies}
      onClick={closeAction}
      screen={controller.selectedStrategy && <MfaScreen selectedStrategy={controller.selectedStrategy} />}
    />
  );
};

export const MfaSection = () => {
  const model = useMfaSectionModel();
  const controller = useMfaSectionController();

  if (!model.hasUser) {
    return null;
  }

  return (
    <MfaSectionView
      controller={controller}
      showTOTP={model.showTOTP}
      showBackupCode={model.showBackupCode}
      showPhoneCode={model.showPhoneCode}
      hideTOTPDeleteAction={model.hideTOTPDeleteAction}
      totpMenu={<MfaTOTPMenu />}
      totpRemoveScreen={<RemoveMfaTOTPScreen />}
      backupCodeMenu={<MfaBackupCodeMenu />}
      backupCodeCreateScreen={<MfaBackupCodeCreateScreen />}
      phones={model.phones.map(phone => (
        <MfaPhoneCode
          key={phone.id}
          phone={phone}
          showTOTP={model.showTOTP}
          hidePhoneCodeDeleteAction={model.hidePhoneCodeDeleteAction}
        />
      ))}
      addMenu={
        <MfaAddMenu
          strategies={model.secondFactorsAvailableToAdd}
          closeAction={controller.closeAction}
        />
      }
    />
  );
};
