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
import { userProfileSecurityBase as m } from './user-profile-security.messages';

export interface UserProfileBackupCodesDialogViewProps extends UserProfileBackupCodesFlowActions {
  state: UserProfileBackupCodesFlowState;
  isInterrupted?: boolean;
}

export function UserProfileBackupCodesDialogView({
  state,
  isInterrupted = false,
  onCancel,
  onRetry,
  onCopyAndClose,
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
        <Dialog.Title render={<Heading size='sm' />}>{m.backupCodes.title}</Dialog.Title>
        <Dialog.Description render={<Text />}>
          {state.step === 'codes'
            ? m.backupCodes.readyDescription
            : state.step === 'unavailable'
              ? m.backupCodes.unavailableDescription
              : m.backupCodes.generatingDescription}
        </Dialog.Description>
      </Card.Header>
      <Card.Content {...stylex.props(styles.content)}>
        {state.step === 'generating' && state.isSubmitting ? (
          <div
            role='status'
            {...stylex.props(styles.pending)}
          >
            <Spinner />
            <Text>{m.backupCodes.generating}</Text>
          </div>
        ) : null}
        {state.step === 'codes' ? (
          <div
            aria-label={m.backupCodes.title}
            {...stylex.props(styles.codes)}
          >
            {Array.from({ length: Math.ceil(state.codes.length / 2) }, (_, rowIndex) => (
              <div
                key={rowIndex}
                {...stylex.props(styles.codeRow, rowIndex > 0 && styles.rowDivider)}
              >
                {state.codes.slice(rowIndex * 2, rowIndex * 2 + 2).map((code, columnIndex) => (
                  <Text
                    key={code}
                    {...stylex.props(styles.code, columnIndex > 0 && styles.columnDivider)}
                  >
                    {code}
                  </Text>
                ))}
              </div>
            ))}
          </div>
        ) : null}
        {state.step === 'unavailable' ? <Text>{m.backupCodes.unavailable}</Text> : null}
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
          {state.step === 'codes' ? (
            <>
              <Button
                type='button'
                variant='outline'
                {...stylex.props(styles.footerButton)}
                onClick={onDownload}
              >
                {m.common.download}
              </Button>
              <Button
                type='button'
                variant='outline'
                {...stylex.props(styles.footerButton)}
                onClick={onPrint}
              >
                {m.common.print}
              </Button>
              <Button
                type='button'
                {...stylex.props(styles.footerButton)}
                onClick={onCopyAndClose}
              >
                {m.common.copyAndClose}
              </Button>
            </>
          ) : state.step === 'unavailable' ? (
            <Button
              type='button'
              {...stylex.props(styles.footerButton)}
              onClick={onCancel}
            >
              {m.common.done}
            </Button>
          ) : (
            <>
              <Button
                type='button'
                variant='outline'
                {...stylex.props(styles.footerButton)}
                onClick={onCancel}
              >
                {m.common.cancel}
              </Button>
              <SubmitButton {...stylex.props(styles.footerButton)}>{m.common.tryAgain}</SubmitButton>
            </>
          )}
        </Card.Footer>
      ) : null}
    </form>
  );
}
