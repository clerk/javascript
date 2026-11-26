import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { CopyButton } from '../../components/copy-button';
import { Link } from '../../components/link';
import { Text } from '../../components/text';
import { useFlowAutoFocus } from '../../primitives/flow/flow-step-context';
import { truncationStyles } from '../../styles/typography.styles';
import { styles } from './auth.styles';
import type { AuthActionBlockedDetails } from './auth.types';
import { httpsUrl } from './auth.utils';

export interface AuthActionBlockedMessages {
  title: string;
  description: string;
  traceIdLabel: string;
  copyTraceId: string;
  traceIdCopied: string;
  emailSupport?: string;
}

interface AuthActionBlockedProps {
  messages: AuthActionBlockedMessages;
  details?: AuthActionBlockedDetails;
  onEmailSupport?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function AuthActionBlocked({ messages, details, onEmailSupport, focusRef }: AuthActionBlockedProps) {
  const href = httpsUrl(details?.linkUrl);
  const ref = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);
  const support =
    !href && onEmailSupport && messages.emailSupport ? (
      <Button
        ref={ref}
        type='button'
        fullWidth
        onClick={onEmailSupport}
      >
        {messages.emailSupport}
      </Button>
    ) : null;

  return (
    <>
      <Card.Header>
        <Card.Title>{details?.title ?? messages.title}</Card.Title>
        <Card.Description>{details?.description ?? messages.description}</Card.Description>
      </Card.Header>
      {details?.traceId || href || support ? (
        <Card.Content>
          {details?.traceId ? (
            <div {...stylex.props(styles.reference)}>
              <Text
                size='sm'
                xstyle={styles.referenceLabel}
              >
                {messages.traceIdLabel}
              </Text>
              <span {...stylex.props(styles.referenceValue)}>
                <Text
                  render={<span />}
                  size='sm'
                  color='foreground-secondary'
                  title={details.traceId}
                  xstyle={[styles.referenceText, truncationStyles.singleLine]}
                >
                  {details.traceId}
                </Text>
                <CopyButton
                  value={details.traceId}
                  label={messages.copyTraceId}
                  copiedLabel={messages.traceIdCopied}
                  xstyle={styles.referenceCopy}
                />
              </span>
            </div>
          ) : null}
          {href ? (
            <Text
              size='sm'
              xstyle={styles.centered}
            >
              <Link
                ref={ref}
                href={href}
                target='_blank'
                rel='noopener noreferrer'
              >
                {details?.linkText ?? href}
              </Link>
            </Text>
          ) : null}
          {support}
        </Card.Content>
      ) : null}
    </>
  );
}
