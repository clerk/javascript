import { useClerk, useReverification, useSession, useUser } from '@clerk/shared/react';
import type { PhoneNumberResource, UserResource } from '@clerk/shared/types';
import React, { useRef } from 'react';

import { useWizard, Wizard } from '@/common';
import { MfaBackupCodeList } from '@/components/UserProfile/MfaBackupCodeList';
import { useEnvironment } from '@/contexts';
import { useSessionTasksContext, useTaskSetupMfaContext } from '@/contexts/components/SessionTasks';
import { useFieldOTP } from '@/elements/CodeControl';
import { useCardState } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { FormButtonContainer } from '@/elements/FormButtons';
import { useRouter } from '@/router';
import { Button, descriptors, localizationKeys } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { SuccessPage } from '@/ui/elements/SuccessPage';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { SharedFooterActionForSignOut } from './shared';
import { SmsCodeScreen } from './SmsCodeScreen';

type MFAVerifyPhoneForSessionTasksProps = {
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
  onSuccess: () => void;
  onReset: () => void;
};

const MFAVerifyPhoneForSessionTasks = (props: MFAVerifyPhoneForSessionTasksProps) => {
  const { onSuccess, resourceRef, onReset } = props;
  const card = useCardState();
  const phone = resourceRef.current;
  const setReservedForSecondFactor = useReverification(() => phone?.setReservedForSecondFactor({ reserved: true }));

  const prepare = () => {
    return resourceRef.current?.prepareVerification?.()?.catch(err => handleError(err, [], card.setError));
  };

  const enableMfa = async () => {
    card.setLoading(phone?.id);
    try {
      await setReservedForSecondFactor();
      resourceRef.current = phone;
      onSuccess();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  const otp = useFieldOTP({
    onCodeEntryFinished: (code, resolve, reject) => {
      resourceRef.current
        ?.attemptVerification({ code: code })
        .then(() => resolve())
        .catch(reject);
    },
    onResendCodeClicked: () => void prepare(),
    onResolve: enableMfa,
  });

  React.useEffect(() => {
    void prepare();
  }, []);

  return (
    <Card.Content>
      <Header.Root showLogo>
        <Header.Title localizationKey={localizationKeys('userProfile.mfaPhoneCodePage.title')} />
        <Header.Subtitle
          localizationKey={localizationKeys('userProfile.phoneNumberPage.verifySubtitle', {
            identifier: resourceRef.current?.phoneNumber || '',
          })}
        />
      </Header.Root>
      <Card.Alert>{card.error}</Card.Alert>
      <Form.OTPInput
        {...otp}
        label={localizationKeys('userProfile.emailAddressPage.emailCode.formTitle')}
        description={localizationKeys('userProfile.emailAddressPage.emailCode.formSubtitle', {
          identifier: resourceRef.current?.phoneNumber || '',
        })}
        resendButton={localizationKeys('userProfile.emailAddressPage.emailCode.resendButton')}
      />
      <FormButtonContainer
        sx={theme => ({
          flexDirection: 'column',
          gap: theme.space.$2,
        })}
      >
        <Button
          isLoading={otp.isLoading}
          localizationKey={localizationKeys('formButtonPrimary__verify')}
          elementDescriptor={descriptors.formButtonPrimary}
          onClick={otp.onFakeContinue}
        />
        <Button
          variant='ghost'
          isDisabled={otp.isLoading}
          localizationKey={localizationKeys('userProfile.formButtonReset')}
          elementDescriptor={descriptors.formButtonReset}
          onClick={onReset}
        />
      </FormButtonContainer>
    </Card.Content>
  );
};

type AddPhoneForSessionTasksProps = {
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
  onSuccess: () => void;
  onReset: () => void;
  onUseExistingNumberClick: () => void;
};

const AddPhoneForSessionTasks = (props: AddPhoneForSessionTasksProps) => {
  const { resourceRef, onSuccess, onReset, onUseExistingNumberClick } = props;
  const card = useCardState();
  const { user } = useUser();
  const createPhoneNumber = useReverification(
    (user: UserResource, opt: Parameters<UserResource['createPhoneNumber']>[0]) => user.createPhoneNumber(opt),
  );

  const phoneField = useFormControl('phoneNumber', '', {
    type: 'tel',
    label: localizationKeys('formFieldLabel__phoneNumber'),
    isRequired: true,
  });

  const canSubmit = phoneField.value.length > 1 && user?.username !== phoneField.value;
  const hasExistingNumber = !!user?.phoneNumbers?.length;

  const addPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return;
    }
    return createPhoneNumber(user, { phoneNumber: phoneField.value })
      .then(res => {
        resourceRef.current = res;
        onSuccess();
      })
      .catch(e => handleError(e, [phoneField], card.setError));
  };

  return (
    <Card.Content>
      <Header.Root showLogo>
        <Header.Title localizationKey={localizationKeys('userProfile.phoneNumberPage.title')} />
        <Header.Subtitle localizationKey={localizationKeys('userProfile.phoneNumberPage.infoText')} />
      </Header.Root>
      <Card.Alert>{card.error}</Card.Alert>
      <Form.Root onSubmit={e => void addPhone(e)}>
        <Form.ControlRow elementId={phoneField.id}>
          <Form.PhoneInput
            {...phoneField.props}
            autoFocus
          />
        </Form.ControlRow>
        <FormButtonContainer
          sx={theme => ({
            flexDirection: 'column',
            gap: theme.space.$2,
          })}
        >
          <Form.SubmitButton
            hasArrow
            isDisabled={!canSubmit}
            localizationKey={localizationKeys('userProfile.formButtonPrimary__add')}
          />
          <Form.ResetButton
            localizationKey={localizationKeys('userProfile.formButtonReset')}
            onClick={onReset}
          />
        </FormButtonContainer>
      </Form.Root>
    </Card.Content>
  );
};

type SuccessScreenProps = {
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
  onFinish: () => void;
};

const SuccessScreen = (props: SuccessScreenProps) => {
  const { resourceRef, onFinish } = props;

  return (
    <Card.Content>
      <SuccessPage
        title={localizationKeys('userProfile.mfaPhoneCodePage.successTitle')}
        text={
          resourceRef.current?.backupCodes && resourceRef.current?.backupCodes.length > 0
            ? [
                localizationKeys('userProfile.mfaPhoneCodePage.successMessage1'),
                localizationKeys('userProfile.mfaPhoneCodePage.successMessage2'),
              ]
            : [localizationKeys('userProfile.mfaPhoneCodePage.successMessage1')]
        }
        onFinish={onFinish}
        contents={<MfaBackupCodeList backupCodes={resourceRef.current?.backupCodes} />}
        finishButtonProps={{
          block: true,
          hasArrow: true,
        }}
      />
    </Card.Content>
  );
};

export const SmsCodeFlow = () => {
  const clerk = useClerk();
  const { session } = useSession();
  const { navigate } = useRouter();
  const { redirectUrlComplete } = useTaskSetupMfaContext();
  const { navigateOnSetActive } = useSessionTasksContext();

  const ref = useRef<PhoneNumberResource>();
  const wizard = useWizard({ defaultStep: 2 });

  const isInstanceWithBackupCodes = useEnvironment().userSettings.attributes.backup_code?.enabled;

  const handleSuccess = () => {
    void clerk.setActive({
      session: session?.id,
      navigate: async ({ session }) => {
        await navigateOnSetActive?.({ session, redirectUrlComplete });
      },
    });
  };

  const handleReset = () => {
    void navigate(`../`);
  };

  return (
    <Card.Root>
      <Wizard {...wizard.props}>
        {/* Step 0: Add new phone */}
        <AddPhoneForSessionTasks
          resourceRef={ref}
          onSuccess={wizard.nextStep}
          onUseExistingNumberClick={() => wizard.goToStep(2)}
          onReset={handleReset}
        />
        {/* Step 1: Verify phone */}
        <MFAVerifyPhoneForSessionTasks
          resourceRef={ref}
          onSuccess={() => (isInstanceWithBackupCodes ? wizard.goToStep(3) : handleSuccess())}
          onReset={() => wizard.goToStep(2)}
        />
        {/* Step 2: Phone selection (default) */}
        <SmsCodeScreen
          onSuccess={isInstanceWithBackupCodes ? wizard.nextStep : handleSuccess}
          onReset={handleReset}
          onAddPhoneClick={() => wizard.goToStep(0)}
          onUnverifiedPhoneClick={(phone: PhoneNumberResource) => {
            ref.current = phone;
            wizard.goToStep(1);
          }}
          resourceRef={ref}
        />
        {/* Step 3: Success with backup codes */}
        {isInstanceWithBackupCodes && (
          <SuccessScreen
            resourceRef={ref}
            onFinish={handleSuccess}
          />
        )}
      </Wizard>
      <Card.Footer>
        <SharedFooterActionForSignOut />
      </Card.Footer>
    </Card.Root>
  );
};
