import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Text } from '../../../components/text';
import { useMessages } from '../../../localization';
import { useFlowAutoFocus } from '../../../primitives/flow/flow-step-context';
import { styles } from '../sign-up.styles';
import type { SignUpRestrictedScreen } from '../sign-up.types';

interface SignUpRestrictedProps extends SignUpRestrictedScreen {
  waitlist: boolean;
  logo?: { src: string; alt: string };
  focusRef?: Ref<HTMLElement>;
}

export function SignUpRestricted({
  waitlist,
  logo,
  globalErrorMessage,
  onEmailSupport,
  onJoinWaitlist,
  onSignIn,
  focusRef,
}: SignUpRestrictedProps) {
  const m = useMessages('signUp');
  const ref = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);
  const copy = waitlist ? m.waitlist : m.restricted;
  const action = waitlist
    ? { label: m.waitlist.joinWaitlist, onClick: onJoinWaitlist }
    : { label: m.restricted.emailSupport, onClick: onEmailSupport };

  return (
    <>
      <Card.Header>
        {logo ? (
          <Card.Media>
            <img
              src={logo.src}
              alt={logo.alt}
              {...stylex.props(styles.logo)}
            />
          </Card.Media>
        ) : null}
        <Card.Title>{copy.title}</Card.Title>
        <Card.Description>{copy.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        {action.onClick ? (
          <Button
            ref={ref}
            type='button'
            fullWidth
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ) : null}
        {onSignIn ? (
          <Text
            size='sm'
            color='foreground-secondary'
            xstyle={styles.footerText}
          >
            {m.signInPrompt}{' '}
            <Button
              type='button'
              size='sm'
              variant='link'
              onClick={onSignIn}
            >
              {m.signInLink}
            </Button>
          </Text>
        ) : null}
      </Card.Content>
    </>
  );
}
