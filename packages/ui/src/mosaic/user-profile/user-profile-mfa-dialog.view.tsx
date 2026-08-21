import * as stylex from '@stylexjs/stylex';
import { QRCodeSVG } from 'qrcode.react';
import type { FormEvent } from 'react';
import { useId } from 'react';

import { AlertDialog } from '../components/alert-dialog';
import { Button, SubmitButton } from '../components/button';
import { Card } from '../components/card';
import { Dialog } from '../components/dialog';
import { Field } from '../components/field';
import { Heading } from '../components/heading';
import { Input } from '../components/input';
import { Spinner } from '../components/spinner';
import { Text } from '../components/text';
import { themeProps } from '../props';
import type {
  UserProfileMfaAddFlowActions,
  UserProfileMfaAddFlowState,
  UserProfileMfaRemoveFlowActions,
  UserProfileMfaRemoveFlowState,
} from './dialogs/flow.types';
import { CodeInput, PhoneInput, ResendButton } from './dialogs/flow-dialog-chrome';
import { mfaDialogStyles as styles } from './user-profile-mfa-dialog.styles';
import { fill, userProfileSecurityBase as m } from './user-profile-security.messages';

export interface UserProfileMfaAddDialogViewProps extends UserProfileMfaAddFlowActions {
  state: UserProfileMfaAddFlowState;
  isInterrupted?: boolean;
}

export function UserProfileMfaAddDialogView({
  state,
  isInterrupted = false,
  onCancel,
  onPhoneNumberChange,
  onAddPhone,
  onSelectPhone,
  onCodeChange,
  onSubmit,
  onResend,
  onToggleDisplayFormat,
  onCopyBackupCodes,
  onDownloadBackupCodes,
  onPrintBackupCodes,
  onFinish,
  onBack,
  onCopySecret,
}: UserProfileMfaAddDialogViewProps) {
  const title =
    state.step === 'backup-codes'
      ? m.mfa.saveBackupCodesTitle
      : state.method === 'sms'
        ? m.mfa.addPhoneTitle
        : m.mfa.addAuthenticatorTitle;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!state.isSubmitting) {
      onSubmit();
    }
  };

  return (
    <form
      aria-hidden={isInterrupted || undefined}
      onSubmit={submit}
      {...stylex.props(styles.form)}
    >
      <Dialog.CloseButton disabled={state.isSubmitting} />
      <Card.Header>
        <Dialog.Title render={<Heading size='sm' />}>{title}</Dialog.Title>
        <Dialog.Description render={<Text />}>
          <AddDescription state={state} />
        </Dialog.Description>
      </Card.Header>
      <Card.Content {...stylex.props(styles.content)}>
        <AddContent
          state={state}
          onCodeChange={onCodeChange}
          onPhoneNumberChange={onPhoneNumberChange}
          onSelectPhone={onSelectPhone}
          onResend={onResend}
          onSubmit={onSubmit}
          onToggleDisplayFormat={onToggleDisplayFormat}
          onCopyBackupCodes={onCopyBackupCodes}
          onDownloadBackupCodes={onDownloadBackupCodes}
          onPrintBackupCodes={onPrintBackupCodes}
          onCopySecret={onCopySecret}
        />
        {state.errors.form ? (
          <Text
            color='negative'
            role='alert'
          >
            {state.errors.form}
          </Text>
        ) : null}
      </Card.Content>
      {(state.step !== 'preparing' && state.step !== 'preparing-sms') || !state.isSubmitting ? (
        <Card.Footer {...themeProps('user-profile-mfa-add-dialog-actions')}>
          <Button
            type='button'
            disabled={state.isSubmitting}
            variant='outline'
            {...stylex.props(styles.footerButton)}
            onClick={
              state.step === 'phone' || state.step === 'verify' || state.step === 'preparing-sms' ? onBack : onCancel
            }
          >
            {state.step === 'phone' || state.step === 'verify' || state.step === 'preparing-sms'
              ? m.common.back
              : m.common.cancel}
          </Button>
          {state.step === 'backup-codes' || state.step === 'success' ? (
            <Button
              {...stylex.props(styles.footerButton)}
              type='button'
              onClick={onFinish}
            >
              {m.common.done}
            </Button>
          ) : state.step === 'select-phone' ? (
            <Button
              {...stylex.props(styles.footerButton)}
              type='button'
              onClick={onAddPhone}
            >
              {m.mfa.addPhoneTitle}
            </Button>
          ) : (
            <SubmitButton
              disabled={!canSubmit(state)}
              isPending={state.isSubmitting || (state.step === 'verify' && state.status === 'verifying')}
              pendingLabel={state.step === 'verify' ? m.mfa.verifyPending : m.mfa.continuingPending}
              {...stylex.props(styles.footerButton)}
            >
              {state.step === 'verify'
                ? m.mfa.verify
                : state.step === 'preparing'
                  ? m.common.tryAgain
                  : m.common.continue}
            </SubmitButton>
          )}
        </Card.Footer>
      ) : null}
    </form>
  );
}

function AddDescription({ state }: { state: UserProfileMfaAddFlowState }) {
  if (state.step === 'select-phone') {
    return <>{m.mfa.choosePhone}</>;
  }
  if (state.step === 'preparing') {
    return <>{m.mfa.preparingAuthenticator}</>;
  }
  if (state.step === 'preparing-sms') {
    return <>{fill(m.mfa.preparingSms, { identifier: state.identifier })}</>;
  }
  if (state.step === 'backup-codes') {
    return <>{m.mfa.backupDescription}</>;
  }
  if (state.step === 'success') {
    return <>{m.mfa.successDescription}</>;
  }
  if (state.step === 'phone') {
    return <>{m.mfa.phoneDescription}</>;
  }
  if (state.step === 'setup') {
    return <>{m.mfa.setupDescription}</>;
  }
  if (state.method === 'sms') {
    return <>{fill(m.mfa.smsCodeDescription, { identifier: state.identifier ?? '' })}</>;
  }
  return <>{m.mfa.authenticatorCodeDescription}</>;
}

function AddContent({
  state,
  onPhoneNumberChange,
  onSelectPhone,
  onCodeChange,
  onSubmit,
  onResend,
  onToggleDisplayFormat,
  onCopyBackupCodes,
  onDownloadBackupCodes,
  onPrintBackupCodes,
  onCopySecret,
}: Pick<
  UserProfileMfaAddDialogViewProps,
  | 'state'
  | 'onPhoneNumberChange'
  | 'onSelectPhone'
  | 'onCodeChange'
  | 'onSubmit'
  | 'onResend'
  | 'onToggleDisplayFormat'
  | 'onCopyBackupCodes'
  | 'onDownloadBackupCodes'
  | 'onPrintBackupCodes'
  | 'onCopySecret'
>) {
  const fieldId = useId();

  if (state.step === 'select-phone') {
    return (
      <div {...stylex.props(styles.phoneOptions)}>
        {state.phones.map(phone => (
          <SubmitButton
            key={phone.id}
            disabled={state.isSubmitting}
            isPending={state.loadingPhoneId === phone.id}
            pendingLabel={fill(m.mfa.addingPhone, { identifier: phone.label })}
            type='button'
            variant='outline'
            {...stylex.props(styles.phoneOption)}
            onClick={() => onSelectPhone(phone.id)}
          >
            {phone.label}
          </SubmitButton>
        ))}
      </div>
    );
  }

  if (state.step === 'preparing' || state.step === 'preparing-sms') {
    return state.isSubmitting ? (
      <div
        role='status'
        {...stylex.props(styles.pending)}
      >
        <Spinner />
        <Text>{state.step === 'preparing-sms' ? m.mfa.preparingSmsPending : m.mfa.preparingAuthenticatorPending}</Text>
      </div>
    ) : null;
  }

  if (state.step === 'backup-codes') {
    return (
      <>
        <div
          aria-label={m.backupCodes.title}
          {...stylex.props(styles.codes)}
        >
          {state.codes.map(code => (
            <Text
              key={code}
              {...stylex.props(styles.code)}
            >
              {code}
            </Text>
          ))}
        </div>
        <div {...stylex.props(styles.backupActions)}>
          <Button
            type='button'
            variant='outline'
            onClick={onCopyBackupCodes}
          >
            {state.copied ? m.common.copied : m.common.copy}
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={onDownloadBackupCodes}
          >
            {m.common.download}
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={onPrintBackupCodes}
          >
            {m.common.print}
          </Button>
        </div>
      </>
    );
  }

  if (state.step === 'success') {
    return <Text>{m.mfa.added}</Text>;
  }

  if (state.step === 'phone') {
    return (
      <Field.Root
        required
        disabled={state.isSubmitting}
        invalid={Boolean(state.errors.field)}
        {...stylex.props(styles.field)}
      >
        <Field.Label htmlFor={fieldId}>{m.mfa.phoneNumber}</Field.Label>
        <PhoneInput
          disabled={state.isSubmitting}
          id={fieldId}
          value={state.phoneNumber}
          onChange={onPhoneNumberChange}
        />
        {state.errors.field ? <Field.Error>{state.errors.field}</Field.Error> : null}
      </Field.Root>
    );
  }

  if (state.step === 'setup') {
    return (
      <div {...stylex.props(styles.setup)}>
        {state.displayFormat === 'qr' ? (
          <QRCodeSVG
            aria-label={m.mfa.qrCode}
            role='img'
            size={192}
            value={state.uri ?? state.secret}
            {...stylex.props(styles.qrPlaceholder)}
          />
        ) : (
          <div {...stylex.props(styles.manualSetup)}>
            <Field.Root>
              <Field.Label>{m.mfa.setupKey}</Field.Label>
              <Input
                readOnly
                spellCheck={false}
                value={state.secret}
              />
            </Field.Root>
            {state.uri ? (
              <Field.Root>
                <Field.Label>{m.mfa.totpUri}</Field.Label>
                <Input
                  readOnly
                  spellCheck={false}
                  value={state.uri}
                />
              </Field.Root>
            ) : null}
            <Button
              size='sm'
              type='button'
              variant='outline'
              onClick={onCopySecret}
            >
              {state.copied ? m.common.copied : m.mfa.copySetupKey}
            </Button>
          </div>
        )}
        <Button
          color='neutral'
          size='sm'
          type='button'
          variant='link'
          onClick={onToggleDisplayFormat}
        >
          {state.displayFormat === 'qr' ? m.mfa.cannotScan : m.mfa.scanInstead}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Field.Root
        required
        disabled={state.isSubmitting || state.status === 'verifying'}
        invalid={state.status === 'error'}
        {...stylex.props(styles.field)}
      >
        <Field.Label htmlFor={fieldId}>{m.common.verificationCode}</Field.Label>
        <CodeInput
          id={fieldId}
          status={state.status}
          value={state.code}
          onChange={onCodeChange}
          onComplete={onSubmit}
        />
        {state.errors.field ? <Field.Error>{state.errors.field}</Field.Error> : null}
      </Field.Root>
      {state.method === 'sms' ? (
        <div {...stylex.props(styles.resend)}>
          <Text color='neutral'>{m.common.didNotReceiveCode}</Text>
          <ResendButton
            disabled={state.isSubmitting || state.status === 'verifying'}
            label={m.common.resend}
            resend={state.resend}
            onResend={onResend}
          />
        </div>
      ) : null}
    </>
  );
}

function canSubmit(state: UserProfileMfaAddFlowState) {
  if (state.step === 'preparing' || state.step === 'preparing-sms') {
    return !state.isSubmitting;
  }
  if (state.step === 'select-phone' || state.step === 'backup-codes' || state.step === 'success') {
    return false;
  }
  if (state.step === 'phone') {
    return state.phoneNumber.length > 3;
  }
  if (state.step === 'verify') {
    return state.code.length === 6 && state.status !== 'verifying';
  }
  return true;
}

export interface UserProfileMfaRemoveDialogViewProps extends UserProfileMfaRemoveFlowActions {
  state: UserProfileMfaRemoveFlowState;
  isInterrupted?: boolean;
}

export function UserProfileMfaRemoveDialogView({
  state,
  isInterrupted = false,
  onCancel,
  onRemove,
}: UserProfileMfaRemoveDialogViewProps) {
  const title = state.method === 'sms' ? m.mfa.removePhoneTitle : m.mfa.removeAuthenticatorTitle;

  return (
    <div aria-hidden={isInterrupted || undefined}>
      <AlertDialog.Title render={<Heading size='sm' />}>{title}</AlertDialog.Title>
      <AlertDialog.Description render={<Text />}>
        {state.method === 'sms'
          ? fill(m.mfa.removePhoneDescription, { identifier: state.label })
          : m.mfa.removeAuthenticatorDescription}
      </AlertDialog.Description>
      {state.errors.form ? (
        <Text
          color='negative'
          role='alert'
        >
          {state.errors.form}
        </Text>
      ) : null}
      <AlertDialog.Actions>
        <Button
          type='button'
          disabled={state.isSubmitting}
          variant='outline'
          onClick={onCancel}
        >
          {m.common.cancel}
        </Button>
        <SubmitButton
          color='negative'
          isPending={state.isSubmitting}
          pendingLabel={state.method === 'sms' ? m.mfa.removingPhone : m.mfa.removingAuthenticator}
          type='button'
          onClick={onRemove}
        >
          {m.common.remove}
        </SubmitButton>
      </AlertDialog.Actions>
    </div>
  );
}
