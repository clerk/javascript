// @ts-ignore
import { default as ExclamationTriangle } from '@clerk/shared/assets/icons/exclamation-triangle.svg';
// @ts-ignore
import { default as MailOpen } from '@clerk/shared/assets/icons/mail-open.svg';
// @ts-ignore
import { default as SwitchArrows } from '@clerk/shared/assets/icons/switch-arrows.svg';
// @ts-ignore
import { default as TickShield } from '@clerk/shared/assets/icons/tick-shield.svg';
import { ButtonWithTimer, ButtonWithTimerProps } from '@clerk/shared/components/button';
import cn from 'classnames';
import React from 'react';

const RESEND_BUTTON_DELAY_IN_MS = 15000;

type MagicLinkWaitingScreenProps = {
  icon: 'shield' | 'warning' | 'mail' | 'switch';
  header: string;
  mainText: React.ReactNode;
  secondaryText?: React.ReactNode;
  noticeText?: React.ReactNode;
  onResendButtonClicked?: () => void;
  resendButtonStartingState?: ButtonWithTimerProps['startingState'];
  className?: string;
};

export function MagicLinkWaitingScreen({
  icon,
  header,
  mainText,
  secondaryText,
  noticeText,
  onResendButtonClicked,
  resendButtonStartingState = 'disabled',
  className,
  ...rest
}: MagicLinkWaitingScreenProps): JSX.Element {
  return (
    <div
      className={cn('cl-verification-page-container', className)}
      {...rest}
      data-test-id='magicLink-waiting-screen'
    >
      <div className='cl-verification-page-icon-container'>
        {icon === 'warning' && <ExclamationTriangle className='cl-verification-page-warning-icon' />}
        {icon === 'shield' && <TickShield className='cl-verification-page-guard-icon' />}
        {icon === 'mail' && <MailOpen className='cl-verification-page-email-icon' />}
        {icon === 'switch' && <SwitchArrows className='cl-verification-page-switch-icon' />}
      </div>
      <h1 className='cl-verification-page-header'>{header}</h1>
      {mainText && <p className='cl-verification-page-text'>{mainText}</p>}
      {secondaryText && <p className='cl-verification-page-text'>{secondaryText}</p>}
      {noticeText && <p className='cl-verification-page-text cl-verify-page-soft-text'>{noticeText}</p>}
      {onResendButtonClicked && (
        <ButtonWithTimer
          throttleTimeInMs={RESEND_BUTTON_DELAY_IN_MS}
          startingState={resendButtonStartingState}
          onClick={onResendButtonClicked}
          className='cl-verify-page-resend-button'
          flavor='link'
        >
          Resend magic link
        </ButtonWithTimer>
      )}
    </div>
  );
}

export function ExpiredRetryMagicLinkWaitingScreen({
  header = 'This magic link has expired',
  icon = 'warning',
  mainText = 'Send a new one or select another method to continue',
  noticeText,
  onResendButtonClicked,
}: Partial<MagicLinkWaitingScreenProps>): JSX.Element {
  return (
    <MagicLinkWaitingScreen
      icon={icon}
      header={header}
      mainText={mainText}
      noticeText={noticeText}
      onResendButtonClicked={onResendButtonClicked}
      resendButtonStartingState='enabled'
    />
  );
}

export function ExpiredMagicLinkWaitingScreen({
  header = 'This magic link has expired',
  icon = 'warning',
  mainText = 'Return to the original tab to continue.',
  noticeText = 'You may close this tab.',
}: Partial<MagicLinkWaitingScreenProps>): JSX.Element {
  return (
    <MagicLinkWaitingScreen
      icon={icon}
      header={header}
      mainText={mainText}
      noticeText={noticeText}
    />
  );
}

export function FailedMagicLinkWaitingScreen({
  icon = 'warning',
  header = 'This magic link is invalid',
  mainText = 'Return to the original tab to continue.',
  noticeText = 'You may close this tab.',
}: Partial<MagicLinkWaitingScreenProps>): JSX.Element {
  return (
    <MagicLinkWaitingScreen
      icon={icon}
      header={header}
      mainText={mainText}
      noticeText={noticeText}
    />
  );
}

export function VerifiedSwitchTabMagicLinkWaitingScreen({
  icon = 'switch',
  header = 'Signed in on other tab',
  mainText = 'Switch to the tab opened by the magic link to continue.',
  noticeText = 'You may close this tab.',
}: Partial<MagicLinkWaitingScreenProps>): JSX.Element {
  return (
    <MagicLinkWaitingScreen
      icon={icon}
      header={header}
      mainText={mainText}
      noticeText={noticeText}
    />
  );
}

export function VerifiedMagicLinkWaitingScreen({
  icon = 'shield',
  header = 'Successfully signed in',
  mainText = 'Return to the original tab to continue.',
  noticeText = 'You may close this tab.',
}: Partial<MagicLinkWaitingScreenProps>): JSX.Element {
  return (
    <MagicLinkWaitingScreen
      icon={icon}
      header={header}
      mainText={mainText}
      noticeText={noticeText}
    />
  );
}
