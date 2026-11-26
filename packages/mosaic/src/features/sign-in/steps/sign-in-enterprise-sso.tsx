import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { VerificationActions } from '../../../blocks/verification';
import { SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { fill, useMessages } from '../../../localization';
import { useFlowAutoFocus } from '../../../primitives/flow/flow-step-context';
import { styles } from '../sign-in.styles';

interface SignInEnterpriseSsoProps {
  applicationName: string;
  logo?: { src: string; alt: string };
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInEnterpriseSso({
  applicationName,
  logo,
  globalErrorMessage,
  isPending,
  onSubmit,
  onCancel,
  focusRef,
}: SignInEnterpriseSsoProps) {
  const m = useMessages('signIn');
  const ref = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);

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
        <Card.Title>{fill(m.start.title, { applicationName })}</Card.Title>
        <Card.Description>{m.start.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        <VerificationActions
          primary={
            <SubmitButton
              ref={ref}
              type='button'
              fullWidth
              isPending={isPending}
              pendingLabel={m.enterpriseSso.pending}
              onClick={onSubmit}
            >
              {m.enterpriseSso.continue}
            </SubmitButton>
          }
          secondaryLabel={m.useAnotherMethod}
          onSecondary={onCancel}
          disabled={isPending}
        />
      </Card.Content>
    </>
  );
}
