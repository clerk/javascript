import * as stylex from '@stylexjs/stylex';

import { Banner } from '../../components/banner';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import type { DialogFocusTarget, DialogTriggerProps } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { Icon } from '../../components/icon';
import { Text } from '../../components/text';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { userProfileBackupCodesMessages as m } from './user-profile-backup-codes.messages';
import { styles } from './user-profile-backup-codes.styles';

export interface UserProfileBackupCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  finalFocus?: DialogFocusTarget;
  codes: readonly string[];
  onRetry: () => void;
  onCopy: () => void;
  onDownload: () => void;
  pendingAction?: 'generate' | 'copy' | 'download';
  errorMessage?: string;
}

export function UserProfileBackupCodesDialog({
  open,
  onOpenChange,
  trigger,
  finalFocus,
  codes,
  onRetry,
  onCopy,
  onDownload,
  pendingAction,
  errorMessage,
}: UserProfileBackupCodesDialogProps) {
  const hasCodes = codes.length > 0 && pendingAction !== 'generate';

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Popup
        variant='card'
        finalFocus={finalFocus}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{m.title}</Card.Title>
            <Card.Description>{m.description}</Card.Description>
          </Card.Header>
          <Card.Content>
            {errorMessage ? (
              <Banner.Root
                color='negative'
                role='alert'
              >
                <Banner.Label>{errorMessage}</Banner.Label>
              </Banner.Root>
            ) : null}
            {hasCodes ? (
              <ul
                aria-label={m.codesLabel}
                {...mergeStyleProps(themeProps('backup-codes'), stylex.props(reset.base, styles.codes))}
              >
                {codes.map(code => (
                  <li
                    key={code}
                    {...stylex.props(reset.base, styles.cell)}
                  >
                    <Text
                      render={<code />}
                      color='foreground-secondary'
                      xstyle={styles.code}
                    >
                      {code}
                    </Text>
                  </li>
                ))}
              </ul>
            ) : pendingAction === 'generate' ? (
              <div
                role='status'
                aria-label={m.generating}
                {...stylex.props(reset.base, styles.codes)}
              >
                {Array.from({ length: 10 }, (_, index) => (
                  <div
                    key={index}
                    aria-hidden='true'
                    {...stylex.props(reset.base, styles.cell)}
                  >
                    <Text
                      render={<span />}
                      xstyle={styles.skeleton}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </Card.Content>
          <Card.Footer>
            {hasCodes ? (
              <>
                <SubmitButton
                  type='button'
                  variant='outline'
                  color='neutral'
                  fullWidth
                  isPending={pendingAction === 'download'}
                  disabled={pendingAction === 'copy'}
                  pendingLabel={m.downloading}
                  onClick={onDownload}
                >
                  <Icon
                    name='download'
                    placement='inline-start'
                  />
                  {m.download}
                </SubmitButton>
                <SubmitButton
                  type='button'
                  fullWidth
                  isPending={pendingAction === 'copy'}
                  disabled={pendingAction === 'download'}
                  pendingLabel={m.copying}
                  onClick={onCopy}
                >
                  <Icon
                    name='clipboard'
                    placement='inline-start'
                  />
                  {m.copyAndClose}
                </SubmitButton>
              </>
            ) : (
              <>
                <Dialog.Close
                  render={
                    <Button
                      variant='outline'
                      color='neutral'
                      fullWidth
                      disabled={Boolean(pendingAction)}
                    />
                  }
                >
                  {m.cancel}
                </Dialog.Close>
                <SubmitButton
                  type='button'
                  fullWidth
                  isPending={pendingAction === 'generate'}
                  pendingLabel={m.generating}
                  onClick={onRetry}
                >
                  {m.retry}
                </SubmitButton>
              </>
            )}
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
