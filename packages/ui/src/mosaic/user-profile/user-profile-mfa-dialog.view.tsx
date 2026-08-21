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
      ? 'Save your backup codes'
      : state.method === 'sms'
        ? 'Add phone number'
        : 'Add authenticator app';
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
            {state.step === 'phone' || state.step === 'verify' || state.step === 'preparing-sms' ? 'Back' : 'Cancel'}
          </Button>
          {state.step === 'backup-codes' || state.step === 'success' ? (
            <Button
              {...stylex.props(styles.footerButton)}
              type='button'
              onClick={onFinish}
            >
              Done
            </Button>
          ) : state.step === 'select-phone' ? (
            <Button
              {...stylex.props(styles.footerButton)}
              type='button'
              onClick={onAddPhone}
            >
              Add phone number
            </Button>
          ) : (
            <SubmitButton
              disabled={!canSubmit(state)}
              isPending={state.isSubmitting || (state.step === 'verify' && state.status === 'verifying')}
              pendingLabel={state.step === 'verify' ? 'Verifying code' : 'Continuing'}
              {...stylex.props(styles.footerButton)}
            >
              {state.step === 'verify' ? 'Verify' : state.step === 'preparing' ? 'Try again' : 'Continue'}
            </SubmitButton>
          )}
        </Card.Footer>
      ) : null}
    </form>
  );
}

function AddDescription({ state }: { state: UserProfileMfaAddFlowState }) {
  if (state.step === 'select-phone') {
    return <>Choose an existing phone number or add a new one.</>;
  }
  if (state.step === 'preparing') {
    return <>Preparing your authenticator setup.</>;
  }
  if (state.step === 'preparing-sms') {
    return <>Sending a verification code to {state.identifier}.</>;
  }
  if (state.step === 'backup-codes') {
    return <>Store these somewhere safe. Each backup code can only be used once.</>;
  }
  if (state.step === 'success') {
    return <>Your authenticator app has been added.</>;
  }
  if (state.step === 'phone') {
    return <>We&apos;ll send a verification code to this phone number.</>;
  }
  if (state.step === 'setup') {
    return <>Scan the QR code with your authenticator app, then continue.</>;
  }
  if (state.method === 'sms') {
    return <>Enter the verification code sent to {state.identifier}.</>;
  }
  return <>Enter the verification code generated by your authenticator app.</>;
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
            pendingLabel={`Adding ${phone.label}`}
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
        <Text>{state.step === 'preparing-sms' ? 'Sending verification code…' : 'Preparing authenticator setup…'}</Text>
      </div>
    ) : null;
  }

  if (state.step === 'backup-codes') {
    return (
      <>
        <div
          aria-label='Backup codes'
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
            {state.copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={onDownloadBackupCodes}
          >
            Download
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={onPrintBackupCodes}
          >
            Print
          </Button>
        </div>
      </>
    );
  }

  if (state.step === 'success') {
    return <Text>You can now use codes from your authenticator app when you sign in.</Text>;
  }

  if (state.step === 'phone') {
    return (
      <Field.Root
        required
        disabled={state.isSubmitting}
        invalid={Boolean(state.errors.field)}
        {...stylex.props(styles.field)}
      >
        <Field.Label htmlFor={fieldId}>Phone number</Field.Label>
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
            aria-label='Authenticator QR code'
            role='img'
            size={192}
            value={state.uri ?? state.secret}
            {...stylex.props(styles.qrPlaceholder)}
          />
        ) : (
          <div>
            <Text
              render={<code />}
              {...stylex.props(styles.secret)}
            >
              {state.secret}
            </Text>
            {state.uri ? (
              <Text
                render={<code />}
                {...stylex.props(styles.secret)}
              >
                {state.uri}
              </Text>
            ) : null}
            <Button
              size='sm'
              type='button'
              variant='outline'
              onClick={onCopySecret}
            >
              {state.copied ? 'Copied' : 'Copy setup key'}
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
          {state.displayFormat === 'qr' ? "Can't scan the QR code?" : 'Scan QR code instead'}
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
        <Field.Label htmlFor={fieldId}>Verification code</Field.Label>
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
          <Text color='neutral'>Didn&apos;t receive a code?</Text>
          <ResendButton
            disabled={state.isSubmitting || state.status === 'verifying'}
            label='Resend'
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
  const methodName = state.method === 'sms' ? 'phone number' : 'authenticator app';

  return (
    <div aria-hidden={isInterrupted || undefined}>
      <AlertDialog.Title render={<Heading size='sm' />}>Remove {methodName}</AlertDialog.Title>
      <AlertDialog.Description render={<Text />}>
        {state.method === 'sms'
          ? `${state.label} will no longer receive verification codes when you sign in.`
          : 'Verification codes from this authenticator will no longer be required when you sign in.'}
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
          Cancel
        </Button>
        <SubmitButton
          color='negative'
          isPending={state.isSubmitting}
          pendingLabel={`Removing ${methodName}`}
          type='button'
          onClick={onRemove}
        >
          Remove
        </SubmitButton>
      </AlertDialog.Actions>
    </div>
  );
}
