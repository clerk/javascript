import { Card } from '../../../components/card';
import { CopyButton } from '../../../components/copy-button';
import { Field } from '../../../components/field';
import { InputGroup } from '../../../components/input-group';
import { Link } from '../../../components/link';
import { useMessages } from '../../../localization';
import type { AuthFlowActionBlockedDetails } from '../auth-flow.types';
import { httpsUrl } from '../auth-flow.utils';

interface ActionBlockedNoticeProps {
  details?: AuthFlowActionBlockedDetails;
}

export function ActionBlockedNotice({ details }: ActionBlockedNoticeProps) {
  const m = useMessages('signIn').actionBlocked;
  const href = httpsUrl(details?.linkUrl);

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
