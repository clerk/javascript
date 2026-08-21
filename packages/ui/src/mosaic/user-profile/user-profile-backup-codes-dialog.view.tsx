import * as stylex from '@stylexjs/stylex';
import type { FormEvent } from 'react';

import { Button, SubmitButton } from '../components/button';
import { Card } from '../components/card';
import { Dialog } from '../components/dialog';
import { Heading } from '../components/heading';
import { Spinner } from '../components/spinner';
import { Text } from '../components/text';
import type { UserProfileBackupCodesFlowActions, UserProfileBackupCodesFlowState } from './dialogs/flow.types';
import { backupCodesDialogStyles as styles } from './user-profile-backup-codes-dialog.styles';

export interface UserProfileBackupCodesDialogViewProps extends UserProfileBackupCodesFlowActions {
  state: UserProfileBackupCodesFlowState;
  isInterrupted?: boolean;
}

export function UserProfileBackupCodesDialogView({
  state,
  isInterrupted = false,
  onCancel,
  onRetry,
  onCopy,
  onDownload,
  onPrint,
}: UserProfileBackupCodesDialogViewProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state.step === 'generating' && !state.isSubmitting) {
      onRetry();
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
        <Dialog.Title render={<Heading size='sm' />}>Backup codes</Dialog.Title>
        <Dialog.Description render={<Text />}>
          {state.step === 'codes'
            ? 'Save these backup codes somewhere safe. Each code can only be used once.'
            : state.step === 'unavailable'
              ? 'No backup codes were returned for this account.'
              : 'Creating a new set of backup codes.'}
        </Dialog.Description>
      </Card.Header>
      <Card.Content {...stylex.props(styles.content)}>
        {state.step === 'generating' && state.isSubmitting ? (
          <div
            role='status'
            {...stylex.props(styles.pending)}
          >
            <Spinner />
            <Text>Generating new backup codes…</Text>
          </div>
        ) : null}
        {state.step === 'codes' ? (
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
            <div {...stylex.props(styles.actions)}>
              <Button
                type='button'
                disabled={state.isSubmitting}
                variant='outline'
                onClick={onCopy}
              >
                {state.copied ? 'Copied' : 'Copy'}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={onDownload}
              >
                Download
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={onPrint}
              >
                Print
              </Button>
            </div>
          </>
        ) : null}
        {state.step === 'unavailable' ? <Text>No backup codes are available. Try generating a new set.</Text> : null}
        {state.errors.form ? (
          <Text
            color='negative'
            role='alert'
          >
            {state.errors.form}
          </Text>
        ) : null}
      </Card.Content>
      {state.step === 'codes' || state.step === 'unavailable' || !state.isSubmitting ? (
        <Card.Footer>
          {state.step === 'codes' || state.step === 'unavailable' ? (
            <Button
              type='button'
              {...stylex.props(styles.footerButton)}
              onClick={onCancel}
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                type='button'
                variant='outline'
                {...stylex.props(styles.footerButton)}
                onClick={onCancel}
              >
                Cancel
              </Button>
              <SubmitButton {...stylex.props(styles.footerButton)}>Try again</SubmitButton>
            </>
          )}
        </Card.Footer>
      ) : null}
    </form>
  );
}
