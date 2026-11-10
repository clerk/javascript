import { Card } from '../../../components/card';
import { CopyButton } from '../../../components/copy-button';
import { Field } from '../../../components/field';
import { InputGroup } from '../../../components/input-group';
import { Link } from '../../../components/link';
import { useMessages } from '../../../localization';
import type { SignInActionBlockedDetails } from '../sign-in.types';

interface SignInActionBlockedProps {
  details?: SignInActionBlockedDetails;
}

export function SignInActionBlocked({ details }: SignInActionBlockedProps) {
  const m = useMessages('signIn').actionBlocked;
  const href = details?.linkUrl;

  return (
    <>
      <Card.Header>
        <Card.Title>{details?.title ?? m.title}</Card.Title>
        <Card.Description>{details?.description ?? m.description}</Card.Description>
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
            <Field.Label>{m.traceIdLabel}</Field.Label>
            <InputGroup.Root>
              <InputGroup.Input
                value={details.traceId}
                readOnly
              />
              <InputGroup.End>
                <CopyButton
                  value={details.traceId}
                  label={m.copyTraceId}
                  copiedLabel={m.traceIdCopied}
                />
              </InputGroup.End>
            </InputGroup.Root>
          </Field.Root>
        </Card.Content>
      ) : null}
    </>
  );
}
