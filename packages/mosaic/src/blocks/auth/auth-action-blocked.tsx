import { Card } from '../../components/card';
import { CopyButton } from '../../components/copy-button';
import { Field } from '../../components/field';
import { InputGroup } from '../../components/input-group';
import { Link } from '../../components/link';
import type { AuthActionBlockedDetails } from './auth.types';
import { httpsUrl } from './auth.utils';

export interface AuthActionBlockedMessages {
  title: string;
  description: string;
  traceIdLabel: string;
  copyTraceId: string;
  traceIdCopied: string;
}

interface AuthActionBlockedProps {
  messages: AuthActionBlockedMessages;
  details?: AuthActionBlockedDetails;
}

export function AuthActionBlocked({ messages, details }: AuthActionBlockedProps) {
  const href = httpsUrl(details?.linkUrl);

  return (
    <>
      <Card.Header>
        <Card.Title>{details?.title ?? messages.title}</Card.Title>
        <Card.Description>{details?.description ?? messages.description}</Card.Description>
        {href ? (
          <Card.Description>
            <Link
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              size='sm'
            >
              {details?.linkText ?? href}
            </Link>
          </Card.Description>
        ) : null}
      </Card.Header>
      {details?.traceId ? (
        <Card.Content>
          <Field.Root>
            <Field.Label>{messages.traceIdLabel}</Field.Label>
            <InputGroup.Root>
              <InputGroup.Input
                value={details.traceId}
                readOnly
              />
              <InputGroup.End>
                <CopyButton
                  value={details.traceId}
                  label={messages.copyTraceId}
                  copiedLabel={messages.traceIdCopied}
                />
              </InputGroup.End>
            </InputGroup.Root>
          </Field.Root>
        </Card.Content>
      ) : null}
    </>
  );
}
