import { withCardStateProvider } from '@/ui/elements/contexts';
import { localizationKeys } from '@/ui/localization';

import { useMfaPhoneCodeScreenController, useMfaPhoneRequestController } from './mfa-phone-code-screen.controller';
import { useMfaPhoneCodeScreenModel } from './mfa-phone-code-screen.model';
import type {
  MfaPhoneCodeScreenData,
  MfaPhoneCodeScreenProps,
  MFAVerifyPhoneProps,
} from './mfa-phone-code-screen.types';
import {
  AddMfaView,
  EnableMFAButtonForPhoneView,
  MfaPhoneCodeScreenView,
  MFAVerifyPhoneView,
} from './mfa-phone-code-screen.view';
import { MfaBackupCodeList } from './MfaBackupCodeList';
import { AddPhone } from './PhoneForm';
import { VerifyWithCode } from './VerifyWithCode';

export const MfaPhoneCodeScreen = (props: MfaPhoneCodeScreenProps) => {
  const model = useMfaPhoneCodeScreenModel();
  return (
    <MfaPhoneCodeScreenContent
      key={model.requestKey}
      model={model}
      {...props}
    />
  );
};

const MfaPhoneCodeScreenContent = withCardStateProvider(
  ({ model, ...props }: MfaPhoneCodeScreenProps & { model: MfaPhoneCodeScreenData }) => {
    const controller = useMfaPhoneCodeScreenController(model, props);
    return (
      <MfaPhoneCodeScreenView
        controller={controller}
        onReset={controller.onReset}
        hasBackupCodes={model.hasBackupCodes}
        hasNewBackupCodes={model.hasNewBackupCodes}
        addPhone={
          <AddPhone
            title={localizationKeys('userProfile.phoneNumberPage.title')}
            model={model.addPhone}
            onSuccess={controller.nextStep}
            onUseExistingNumberClick={() => controller.goToStep(2)}
            onReset={controller.onReset}
          />
        }
        verifyPhone={
          <MFAVerifyPhoneView
            title={localizationKeys('userProfile.mfaPhoneCodePage.title')}
            phoneNumber={model.verifyPhone.verification.identifier}
            verification={
              <VerifyWithCode
                {...model.verifyPhone.verification}
                nextStep={() => void controller.enableSelectedPhone()}
                onReset={() => controller.goToStep(2)}
              />
            }
          />
        }
        addMfa={
          model.addMfa.hasUser ? (
            <AddMfaView
              title={localizationKeys('userProfile.mfaPhoneCodePage.title')}
              hasAvailableMethods={model.addMfa.phones.length > 0}
              onReset={controller.onReset}
              onAddPhoneClick={() => controller.goToStep(0)}
              phoneButtons={model.addMfa.phones.map(phone => (
                <EnableMFAButtonForPhoneView
                  key={phone.id}
                  controller={{
                    id: phone.id,
                    label: phone.label,
                    isLoading: controller.isLoading(phone.id),
                    isDisabled: controller.isDisabled,
                    enableMfa: () => controller.selectOrEnablePhone(phone),
                  }}
                />
              ))}
            />
          ) : null
        }
        backupCodeList={<MfaBackupCodeList backupCodes={model.backupCodes} />}
      />
    );
  },
);

export const MFAVerifyPhone = (props: MFAVerifyPhoneProps) => {
  const request = useMfaPhoneRequestController(props.model);
  return (
    <MFAVerifyPhoneView
      title={props.title}
      phoneNumber={props.model.verification.identifier}
      verification={
        <VerifyWithCode
          {...props.model.verification}
          nextStep={() =>
            void request.run(props.model.id, canContinue => props.model.enableMfa(canContinue), props.onSuccess)
          }
          onReset={props.onReset}
        />
      }
    />
  );
};
