import * as stylex from '@stylexjs/stylex';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { Text } from '../../../components/text';
import { useMessages } from '../../../localization';
import { mergeStyleProps, themeProps } from '../../../props';
import { reset } from '../../../styles/reset.styles';
import { styles } from './user-profile-backup-codes.styles';

export interface UserProfileBackupCodesViewProps {
  onCancel: () => void;
  onBack?: () => void;
  codes: readonly string[];
  onRetry: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onPrint?: () => void;
  pendingAction?: 'generate' | 'copy' | 'download';
  errorMessage?: string;
}

export function UserProfileBackupCodesView({
  onCancel,
  onBack,
  codes,
  onRetry,
  onCopy,
  onDownload,
  onPrint,
  pendingAction,
  errorMessage,
}: UserProfileBackupCodesViewProps) {
  const m = useMessages('userProfileBackupCodes');
  const actionRef = useFlowAutoFocus<HTMLButtonElement>();
  const hasCodes = codes.length > 0 && pendingAction !== 'generate';
  const showSaveActions = hasCodes || pendingAction === 'generate';

  return (
    <>
      <Card.Header>
        <Card.Title>{m.title}</Card.Title>
        <Card.Description>{m.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {errorMessage}
      </Card.Banner>
      <Card.Content>
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
        {showSaveActions ? (
          <>
            {onPrint ? (
              <Button
                type='button'
                variant='outline'
                color='neutral'
                fullWidth
                disabled={!hasCodes}
                onClick={onPrint}
              >
                {m.print}
              </Button>
            ) : null}
            <SubmitButton
              type='button'
              variant='outline'
              color='neutral'
              fullWidth
              isPending={pendingAction === 'download'}
              disabled={!hasCodes || pendingAction === 'copy'}
              pendingLabel={m.downloading}
              onClick={onDownload}
            >
              <Icon
                name='download'
                placement='inline-start'
              />
              {m.download}
            </SubmitButton>
          </>
        ) : (
          <Button
            type='button'
            variant='outline'
            color='neutral'
            fullWidth
            disabled={Boolean(pendingAction)}
            onClick={onBack ?? onCancel}
          >
            {onBack ? m.back : m.cancel}
          </Button>
        )}
        <SubmitButton
          type='button'
          fullWidth
          isPending={pendingAction === 'copy'}
          disabled={showSaveActions && (!hasCodes || pendingAction === 'download')}
          focusableWhenDisabled
          ref={actionRef}
          pendingLabel={m.copying}
          onClick={showSaveActions ? onCopy : onRetry}
        >
          {showSaveActions ? (
            <Icon
              name='clipboard'
              placement='inline-start'
            />
          ) : null}
          {showSaveActions ? m.copyAndClose : m.retry}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
