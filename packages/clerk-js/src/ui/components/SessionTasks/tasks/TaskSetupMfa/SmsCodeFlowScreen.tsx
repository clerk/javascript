import { useReverification, useUser } from '@clerk/shared/react';
import type { PhoneNumberResource, UserResource } from '@clerk/shared/types';
import React, { useMemo, useRef } from 'react';

import { useWizard, Wizard } from '@/ui/common';
import { MfaBackupCodeList } from '@/ui/components/UserProfile/MfaBackupCodeList';
import { Button, Col, descriptors, Flex, Flow, localizationKeys, Text } from '@/ui/customizables';
import { Action, Actions } from '@/ui/elements/Actions';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { Header } from '@/ui/elements/Header';
import { PreviewButton } from '@/ui/elements/PreviewButton';
import { SuccessPage } from '@/ui/elements/SuccessPage';
import { type VerificationCodeCardProps, VerificationCodeContent } from '@/ui/elements/VerificationCodeCard';
import { Add } from '@/ui/icons';
import { handleError } from '@/ui/utils/errorHandler';
import { getFlagEmojiFromCountryIso, parsePhoneString, stringToFormattedPhoneString } from '@/ui/utils/phoneUtils';
import { useFormControl } from '@/ui/utils/useFormControl';

import { SharedFooterActionForSignOut } from './shared';

type MFAVerifyPhoneForSessionTasksProps = {
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
  onSuccess: () => void;
  onReset: () => void;
};

export const getAvailablePhonesFromUser = (user: UserResource | undefined | null) => {
  return (
    user?.phoneNumbers.filter(phoneNumber => {
      const hasOtherIdentifications =
        user?.primaryEmailAddress !== null ||
        user?.primaryWeb3Wallet !== null ||
        user?.passkeys.length > 0 ||
        user?.externalAccounts.length > 0 ||
        user?.enterpriseAccounts.length > 0 ||
        user?.username !== null;

      if (phoneNumber.id === user?.primaryPhoneNumber?.id && !hasOtherIdentifications) {
        return false;
      }
      return !phoneNumber.reservedForSecondFactor;
    }) || []
  );
};

const MFAVerifyPhoneForSessionTasks = withCardStateProvider((props: MFAVerifyPhoneForSessionTasksProps) => {
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
      const result = await setReservedForSecondFactor();
      resourceRef.current = result;
      onSuccess();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  React.useEffect(() => {
    void prepare();
  }, []);

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    void resourceRef.current
      ?.attemptVerification({ code: code })
      .then(async () => {
        await resolve();
        await enableMfa();
      })
      .catch(reject);
  };

  return (
    <Card.Content>
      <VerificationCodeContent
        cardTitle={localizationKeys('taskSetupMfa.smsCode.verifyPhone.title')}
        cardSubtitle={localizationKeys('taskSetupMfa.smsCode.verifyPhone.subtitle')}
        safeIdentifier={resourceRef.current?.phoneNumber || ''}
        inputLabel={localizationKeys('taskSetupMfa.smsCode.verifyPhone.formTitle')}
        resendButton={localizationKeys('taskSetupMfa.smsCode.verifyPhone.resendButton')}
        badgeText={localizationKeys('taskSetupMfa.badge')}
        onCodeEntryFinishedAction={action}
        onResendCodeClicked={() => void prepare()}
        onIdentityPreviewEditClicked={() => onReset()}
        onBackLinkClicked={() => onReset()}
        backLinkLabel={localizationKeys('taskSetupMfa.smsCode.cancel')}
      />
    </Card.Content>
  );
});

type AddPhoneForSessionTasksProps = {
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
  onSuccess: () => void;
  onReset: () => void;
};

const AddPhoneForSessionTasks = withCardStateProvider((props: AddPhoneForSessionTasksProps) => {
  const { resourceRef, onSuccess, onReset } = props;
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

  const addPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return;
    }
    await card.runAsync(async () => {
      try {
        const res = await createPhoneNumber(user, { phoneNumber: phoneField.value });
        resourceRef.current = res;
        onSuccess();
      } catch (e) {
        handleError(e as Error, [phoneField], card.setError);
      }
    });
  };

  return (
    <Card.Content>
      <Header.Root
        gap={4}
        badgeText={localizationKeys('taskSetupMfa.badge')}
      >
        <Header.Title localizationKey={localizationKeys('taskSetupMfa.smsCode.addPhoneNumber')} />
        <Header.Subtitle localizationKey={localizationKeys('taskSetupMfa.smsCode.addPhone.infoText')} />
      </Header.Root>
      <Card.Alert>{card.error}</Card.Alert>
      <Form.Root onSubmit={addPhone}>
        <Form.ControlRow elementId={phoneField.id}>
          <Form.PhoneInput
            {...phoneField.props}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
        </Form.ControlRow>
        <FormButtonContainer
          sx={theme => ({
            flexDirection: 'column',
            gap: theme.space.$4,
          })}
        >
          <Form.SubmitButton
            hasArrow
            isDisabled={!canSubmit}
            localizationKey={localizationKeys('taskSetupMfa.smsCode.addPhone.formButtonPrimary')}
          />
          <Form.ResetButton
            localizationKey={localizationKeys('taskSetupMfa.smsCode.cancel')}
            onClick={onReset}
          />
        </FormButtonContainer>
      </Form.Root>
    </Card.Content>
  );
});

type SuccessScreenProps = {
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
  onFinish: () => void;
};

const SuccessScreen = withCardStateProvider((props: SuccessScreenProps) => {
  const { resourceRef, onFinish } = props;

  return (
    <Card.Content>
      <SuccessPage
        title={localizationKeys('taskSetupMfa.smsCode.success.title')}
        subtitle={localizationKeys('taskSetupMfa.smsCode.success.message1')}
        headerBadgeText={localizationKeys('taskSetupMfa.badge')}
        onFinish={onFinish}
        contents={
          <MfaBackupCodeList
            backupCodes={resourceRef.current?.backupCodes}
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
});

type PhoneItemProps = {
  phone: PhoneNumberResource;
  onSuccess: () => void;
  onUnverifiedPhoneClick: (phone: PhoneNumberResource) => void;
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
};

const PhoneItem = ({ phone, onSuccess, onUnverifiedPhoneClick, resourceRef }: PhoneItemProps) => {
  const card = useCardState();
  const setReservedForSecondFactor = useReverification(() => phone.setReservedForSecondFactor({ reserved: true }));

  const { iso } = parsePhoneString(phone.phoneNumber);
  const flag = getFlagEmojiFromCountryIso(iso);
  const formattedPhone = stringToFormattedPhoneString(phone.phoneNumber);

  const handleSelect = async () => {
    if (phone.verification.status !== 'verified') {
      return onUnverifiedPhoneClick(phone);
    }

    card.setLoading(phone.id);
    try {
      const result = await setReservedForSecondFactor();
      resourceRef.current = result;
      onSuccess();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <PreviewButton
      isLoading={card.loadingMetadata === phone.id}
      hoverAsFocus
      block
      elementDescriptor={descriptors.taskSetupMfaPhoneSelectionItem}
      sx={t => ({
        padding: `${t.space.$4} ${t.space.$6}`,
      })}
      onClick={() => void handleSelect()}
    >
      <Flex sx={t => ({ gap: t.space.$4, alignItems: 'center' })}>
        <Text sx={t => ({ fontSize: t.fontSizes.$lg })}>{flag}</Text>
        <Text variant='buttonLarge'>{formattedPhone}</Text>
      </Flex>
    </PreviewButton>
  );
};

type SmsCodeScreenProps = {
  onSuccess: () => void;
  onReset: () => void;
  onAddPhoneClick: () => void;
  onUnverifiedPhoneClick: (phone: PhoneNumberResource) => void;
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
  availablePhones: PhoneNumberResource[];
};

const SmsCodeScreen = withCardStateProvider((props: SmsCodeScreenProps) => {
  const { onSuccess, onReset, onAddPhoneClick, onUnverifiedPhoneClick, resourceRef } = props;
  const { user } = useUser();
  const card = useCardState();

  if (!user) {
    return null;
  }

  const availablePhones = getAvailablePhonesFromUser(user);

  return (
    <Flow.Part part='phoneCode'>
      <Card.Content sx={t => ({ padding: t.space.$none })}>
        <Header.Root
          showLogo
          gap={4}
          badgeText={localizationKeys('taskSetupMfa.badge')}
          sx={t => ({
            paddingTop: t.space.$8,
            paddingInline: t.space.$8,
          })}
        >
          <Header.Title localizationKey={localizationKeys('taskSetupMfa.smsCode.title')} />
          <Header.Subtitle localizationKey={localizationKeys('taskSetupMfa.smsCode.subtitle')} />
        </Header.Root>
        {card.error && (
          <Flex sx={t => ({ paddingInline: t.space.$8 })}>
            <Card.Alert>{card.error}</Card.Alert>
          </Flex>
        )}
        <Col>
          <Actions
            role='menu'
            elementDescriptor={descriptors.taskSetupMfaPhoneSelectionItems}
            sx={t => ({
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$borderAlpha100,
            })}
          >
            {availablePhones?.map(phone => (
              <PhoneItem
                key={phone.id}
                phone={phone}
                onSuccess={onSuccess}
                onUnverifiedPhoneClick={onUnverifiedPhoneClick}
                resourceRef={resourceRef}
              />
            ))}
            <Action
              hoverAsFocus
              label={localizationKeys('taskSetupMfa.smsCode.addPhoneNumber')}
              block
              onClick={onAddPhoneClick}
              icon={Add}
              elementDescriptor={descriptors.taskSetupMfaPhoneSelectionAddPhoneAction}
              sx={t => ({
                borderTopWidth: t.borderWidths.$normal,
                borderTopStyle: t.borderStyles.$solid,
                borderTopColor: t.colors.$borderAlpha100,
                padding: `${t.space.$4} ${t.space.$4}`,
                gap: t.space.$2,
              })}
              iconSx={t => ({
                width: t.sizes.$8,
                height: t.sizes.$6,
              })}
            />
          </Actions>
          <Flex
            justify='center'
            sx={t => ({
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$borderAlpha100,
              padding: t.space.$4,
            })}
          >
            <Button
              variant='ghost'
              onClick={onReset}
              block
              elementDescriptor={descriptors.formButtonReset}
              localizationKey={localizationKeys('taskSetupMfa.smsCode.cancel')}
            />
          </Flex>
        </Col>
      </Card.Content>
    </Flow.Part>
  );
});

type SmsCodeFlowProps = {
  onSuccess: () => void;
  goToStartStep: () => void;
};

// This is the order of the steps in the wizard
const STEPS = {
  ADD_PHONE: 0,
  VERIFY_PHONE: 1,
  SELECT_PHONE: 2,
  SUCCESS: 3,
} as const;

export const SmsCodeFlow = (props: SmsCodeFlowProps) => {
  const { onSuccess, goToStartStep } = props;
  const { user } = useUser();

  const ref = useRef<PhoneNumberResource>();

  const availablePhones = useMemo(() => {
    if (!user) {
      return [];
    }
    return getAvailablePhonesFromUser(user);
  }, [user]);

  const wizard = useWizard({ defaultStep: availablePhones.length > 0 ? STEPS.SELECT_PHONE : STEPS.ADD_PHONE });

  return (
    <Card.Root>
      <Wizard
        {...wizard.props}
        animate={false}
      >
        {/* Step 0: Add new phone (default if no available phones) */}
        <AddPhoneForSessionTasks
          resourceRef={ref}
          onSuccess={wizard.nextStep}
          onReset={() => (availablePhones.length > 0 ? wizard.goToStep(STEPS.SELECT_PHONE) : goToStartStep())}
        />
        {/* Step 1: Verify phone */}
        <MFAVerifyPhoneForSessionTasks
          resourceRef={ref}
          onSuccess={() => wizard.goToStep(STEPS.SUCCESS)}
          onReset={() => wizard.goToStep(STEPS.ADD_PHONE)}
        />
        {/* Step 2: Phone selection (default if available phones) */}
        <SmsCodeScreen
          availablePhones={availablePhones}
          onSuccess={wizard.nextStep}
          onReset={goToStartStep}
          onAddPhoneClick={() => wizard.goToStep(STEPS.ADD_PHONE)}
          onUnverifiedPhoneClick={(phone: PhoneNumberResource) => {
            ref.current = phone;
            wizard.goToStep(STEPS.VERIFY_PHONE);
          }}
          resourceRef={ref}
        />
        {/* Step 3: Success with backup codes */}
        <SuccessScreen
          resourceRef={ref}
          onFinish={onSuccess}
        />
      </Wizard>
      <Card.Footer>
        <SharedFooterActionForSignOut />
      </Card.Footer>
    </Card.Root>
  );
};
