import * as stylex from '@stylexjs/stylex';
import type { FormEvent, ReactNode } from 'react';

import { Button, SubmitButton } from '../components/button';
import { Card } from '../components/card';
import { Dialog, type DialogProps } from '../components/dialog';
import { Heading } from '../components/heading';
import { Spinner } from '../components/spinner';
import { Text } from '../components/text';
import type { UserProfileBackupCodesFlowState } from './dialogs/flow.types';
import { backupCodesDialogStyles as styles } from './user-profile-backup-codes-dialog.styles';

export interface UserProfileBackupCodesDialogViewProps extends Pick<
  DialogProps,
  'open' | 'defaultOpen' | 'onOpenChange'
> {
  state: UserProfileBackupCodesFlowState;
  verificationDialog?: ReactNode;
  onRetry: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onPrint: () => void;
}

export function UserProfileBackupCodesDialogView({
  state,
  verificationDialog,
  onRetry,
  onCopy,
  onDownload,
  onPrint,
  ...dialogProps
}: UserProfileBackupCodesDialogViewProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state.step === 'generating' && !state.isSubmitting) {
      onRetry();
    }
  };

  return (
    <Dialog.Root
      size='card'
      closedBy='closerequest'
      {...dialogProps}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup
            render={
              <Card.Root
                elevation='overlay'
                renderBranding={false}
              />
            }
          >
            <Dialog.CloseButton />
            <form
              onSubmit={submit}
              {...stylex.props(styles.form)}
            >
              <Card.Header>
                <Dialog.Title render={<Heading size='sm' />}>Backup codes</Dialog.Title>
                <Dialog.Description render={<Text />}>
                  {state.step === 'codes'
                    ? 'Save these backup codes somewhere safe. Each code can only be used once.'
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
                {state.errors.form ? (
                  <Text
                    color='negative'
                    role='alert'
                  >
                    {state.errors.form}
                  </Text>
                ) : null}
              </Card.Content>
              {state.step === 'codes' || !state.isSubmitting ? (
                <Card.Footer>
                  {state.step === 'codes' ? (
                    <Dialog.Close
                      render={props => (
                        <Button
                          {...props}
                          {...stylex.props(styles.footerButton)}
                        >
                          Done
                        </Button>
                      )}
                    />
                  ) : (
                    <>
                      <Dialog.Close
                        render={props => (
                          <Button
                            {...props}
                            {...stylex.props(styles.footerButton)}
                            variant='outline'
                          >
                            Cancel
                          </Button>
                        )}
                      />
                      <SubmitButton {...stylex.props(styles.footerButton)}>Try again</SubmitButton>
                    </>
                  )}
                </Card.Footer>
              ) : null}
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
      {verificationDialog}
    </Dialog.Root>
  );
}
