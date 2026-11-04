import * as stylex from '@stylexjs/stylex';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Flow, type FlowDirection, useFlowAutoFocus } from '../../components/flow';
import { Icon, IconFrame } from '../../components/icon';
import { Item } from '../../components/item';
import { Spinner } from '../../components/spinner';
import { Text } from '../../components/text';
import { Checkmark } from '../../icons/glyphs/checkmark';
import { ChevronRight } from '../../icons/glyphs/chevron-right';
import { Clipboard } from '../../icons/glyphs/clipboard';
import { Download } from '../../icons/glyphs/download';
import { SecurityLockSquare } from '../../icons/glyphs/security-lock-square';
import { SecurityPhone } from '../../icons/glyphs/security-phone';
import { fill, useMessages } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import type { ReverificationController } from '../reverification';
import { Reverification } from '../reverification';
import type { UserProfileAddAuthenticatorViewProps } from '../user-profile/user-profile-mfa-section/user-profile-add-authenticator.view';
import { UserProfileAddAuthenticatorView } from '../user-profile/user-profile-mfa-section/user-profile-add-authenticator.view';
import type { UserProfileAddSmsViewProps } from '../user-profile/user-profile-mfa-section/user-profile-add-sms.view';
import { UserProfileAddSmsView } from '../user-profile/user-profile-mfa-section/user-profile-add-sms.view';
import { styles as backupCodeStyles } from '../user-profile/user-profile-mfa-section/user-profile-backup-codes.styles';
import { styles } from './task-setup-mfa.styles';
import type { TaskSetupMfaMethod, TaskSetupMfaStep } from './task-setup-mfa.types';

export interface TaskSetupMfaSelectProps {
  methods: readonly TaskSetupMfaMethod[];
  pendingMethod?: 'authenticator';
  errorMessage?: string;
  onSelect: (method: TaskSetupMfaMethod) => void;
}

export interface TaskSetupMfaSuccessProps {
  method: TaskSetupMfaMethod;
  codes: readonly string[];
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onContinue: () => void;
  pendingAction?: 'copy' | 'complete';
  errorMessage?: string;
}

export interface TaskSetupMfaSignOutProps {
  identifier: string;
  onSignOut: () => void;
  isPending: boolean;
  errorMessage?: string;
}

export interface TaskSetupMfaViewProps {
  step: TaskSetupMfaStep;
  direction: FlowDirection;
  renderBranding: boolean;
  reverification: ReverificationController;
  select: TaskSetupMfaSelectProps;
  sms: UserProfileAddSmsViewProps;
  authenticator?: UserProfileAddAuthenticatorViewProps;
  success: TaskSetupMfaSuccessProps;
  signOut: TaskSetupMfaSignOutProps;
}

const icons = {
  sms: SecurityPhone,
  authenticator: SecurityLockSquare,
} as const;

export function TaskSetupMfaView(props: TaskSetupMfaViewProps) {
  return (
    <Card.Root renderBranding={props.renderBranding}>
      <Flow.Root
        value={props.step}
        direction={props.direction}
        state={props}
      >
        {current => (
          <>
            <Flow.Step ids={['select']}>
              <SelectStep {...current.select} />
            </Flow.Step>
            <Flow.Step ids={['sms']}>
              <UserProfileAddSmsView {...current.sms} />
            </Flow.Step>
            <Flow.Step ids={['authenticator']}>
              {current.authenticator ? <UserProfileAddAuthenticatorView {...current.authenticator} /> : null}
            </Flow.Step>
            <Flow.Step ids={['success']}>
              <SuccessStep {...current.success} />
            </Flow.Step>
            <Flow.Step ids={['verify']}>
              <ReverifyStep controller={current.reverification} />
            </Flow.Step>
          </>
        )}
      </Flow.Root>
      <SignOutFooter {...props.signOut} />
    </Card.Root>
  );
}

function SelectStep({ methods, pendingMethod, errorMessage, onSelect }: TaskSetupMfaSelectProps) {
  const m = useMessages('taskSetupMfa').start;
  const firstMethodRef = useFlowAutoFocus<HTMLDivElement>();

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
        <Item.Group variant='outline'>
          {methods.map((method, index) => (
            <Item.Root
              key={method}
              ref={index === 0 ? firstMethodRef : undefined}
              size='lg'
              render={
                <button
                  type='button'
                  disabled={pendingMethod !== undefined}
                  aria-busy={pendingMethod === method}
                  onClick={() => onSelect(method)}
                />
              }
            >
              <Item.Media>
                <IconFrame
                  filled
                  bordered={false}
                >
                  <Icon glyph={icons[method]} />
                </IconFrame>
              </Item.Media>
              <Item.Content>
                <Item.Label>{m.methods[method]}</Item.Label>
                <Item.Description>{m.methodDescriptions[method]}</Item.Description>
              </Item.Content>
              <Item.Actions>{pendingMethod === method ? <Spinner /> : <Icon glyph={ChevronRight} />}</Item.Actions>
            </Item.Root>
          ))}
        </Item.Group>
      </Card.Content>
    </>
  );
}

function SuccessStep({
  method,
  codes,
  copied,
  onCopy,
  onDownload,
  onPrint,
  onContinue,
  pendingAction,
  errorMessage,
}: TaskSetupMfaSuccessProps) {
  const m = useMessages('taskSetupMfa').success;
  const continueRef = useFlowAutoFocus<HTMLButtonElement>();

  return (
    <>
      <Card.Header>
        <Card.Title>{m[method].title}</Card.Title>
        <Card.Description>{m[method].description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {errorMessage}
      </Card.Banner>
      {codes.length > 0 ? (
        <Card.Content>
          <Text color='foreground-secondary'>{m.backupCodesDescription}</Text>
          <ul
            aria-label={m.codesLabel}
            {...mergeStyleProps(themeProps('backup-codes'), stylex.props(reset.base, backupCodeStyles.codes))}
          >
            {codes.map(code => (
              <li
                key={code}
                {...stylex.props(reset.base, backupCodeStyles.cell)}
              >
                <Text
                  render={<code />}
                  color='foreground-secondary'
                  xstyle={backupCodeStyles.code}
                >
                  {code}
                </Text>
              </li>
            ))}
          </ul>
          <div {...stylex.props(styles.codeActions)}>
            <SubmitButton
              type='button'
              variant='outline'
              color='neutral'
              size='sm'
              isPending={pendingAction === 'copy'}
              disabled={pendingAction === 'complete'}
              pendingLabel={m.copy}
              onClick={onCopy}
            >
              <Icon
                glyph={copied ? Checkmark : Clipboard}
                placement='inline-start'
              />
              {copied ? m.copied : m.copy}
            </SubmitButton>
            <Button
              type='button'
              variant='outline'
              color='neutral'
              size='sm'
              disabled={pendingAction !== undefined}
              onClick={onDownload}
            >
              <Icon
                glyph={Download}
                placement='inline-start'
              />
              {m.download}
            </Button>
            <Button
              type='button'
              variant='outline'
              color='neutral'
              size='sm'
              disabled={pendingAction !== undefined}
              onClick={onPrint}
            >
              {m.print}
            </Button>
          </div>
        </Card.Content>
      ) : null}
      <Card.Footer>
        <SubmitButton
          ref={continueRef}
          type='button'
          isPending={pendingAction === 'complete'}
          disabled={pendingAction === 'copy'}
          focusableWhenDisabled
          pendingLabel={m.pending}
          onClick={onContinue}
        >
          {m.continue}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}

function ReverifyStep({ controller }: { controller: ReverificationController }) {
  const focusRef = useFlowAutoFocus<HTMLElement>();

  return (
    <Reverification
      controller={controller}
      initialFocusRef={focusRef}
    />
  );
}

function SignOutFooter({ identifier, onSignOut, isPending, errorMessage }: TaskSetupMfaSignOutProps) {
  const m = useMessages('taskSetupMfa').signOut;

  return (
    <Card.Footer xstyle={styles.footer}>
      <Text
        size='xs'
        color={errorMessage ? 'negative' : 'foreground-secondary'}
        role={errorMessage ? 'alert' : undefined}
        xstyle={styles.footerText}
      >
        {errorMessage ?? fill(m.text, { identifier })}{' '}
        <Button
          type='button'
          variant='link'
          size='sm'
          fullWidth={false}
          disabled={isPending}
          onClick={onSignOut}
        >
          {m.action}
        </Button>
      </Text>
    </Card.Footer>
  );
}
