import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Banner } from '../../components/banner';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { useFlowAutoFocus } from '../../components/flow';
import { Icon } from '../../components/icon';
import { Text } from '../../components/text';
import { useMessages } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { styles } from './user-profile-backup-codes.styles';

export interface UserProfileBackupCodesViewProps {
  actionRef?: Ref<HTMLButtonElement>;
  onCancel: () => void;
  codes: readonly string[];
  onRetry: () => void;
  onCopy: () => void;
  onDownload: () => void;
  pendingAction?: 'generate' | 'copy' | 'download';
  errorMessage?: string;
}

export function UserProfileBackupCodesView({
  actionRef: actionRefProp,
  onCancel,
  codes,
  onRetry,
  onCopy,
  onDownload,
  pendingAction,
  errorMessage,
}: UserProfileBackupCodesViewProps) {
  const m = useMessages('userProfileBackupCodes');
  const actionRef = useMergeRefs([actionRefProp, useFlowAutoFocus<HTMLButtonElement>()]);
  const hasCodes = codes.length > 0 && pendingAction !== 'generate';

  return (
    <>
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
              ref={actionRef}
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
            <Button
              type='button'
              variant='outline'
              color='neutral'
              fullWidth
              disabled={Boolean(pendingAction)}
              onClick={onCancel}
            >
              {m.cancel}
            </Button>
            <SubmitButton
              type='button'
              fullWidth
              isPending={pendingAction === 'generate'}
              ref={actionRef}
              pendingLabel={m.generating}
              onClick={onRetry}
            >
              {m.retry}
            </SubmitButton>
          </>
        )}
      </Card.Footer>
    </>
  );
}
