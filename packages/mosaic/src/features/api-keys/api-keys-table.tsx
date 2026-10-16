import { isOrganizationId } from '@clerk/shared/internal/clerk-js/organization';
import type { ReactNode } from 'react';

import { useMessages } from '../../localization';
import { useAPIKeysTableController } from './api-keys-table.controller';
import { resolveAPIKeysTableMessages } from './api-keys-table.messages';
import { PAGE_SIZE } from './api-keys-table.model';
import type { APIKeysTableMessages } from './api-keys-table.types';
import { APIKeysTableView } from './api-keys-table.view';

export interface APIKeysTableProps {
  subject: string;
  perPage?: number;
  showDescription?: boolean;
  messages?: Partial<APIKeysTableMessages>;
  fallback?: ReactNode;
}

export interface APIKeysPageProps extends Pick<APIKeysTableProps, 'perPage' | 'showDescription'> {
  hide?: boolean;
}

export function APIKeysTable(props: APIKeysTableProps) {
  return (
    <SubjectAPIKeysTable
      key={props.subject}
      {...props}
    />
  );
}

function SubjectAPIKeysTable({
  subject,
  perPage = PAGE_SIZE,
  showDescription = false,
  messages: overrides,
  fallback,
}: APIKeysTableProps) {
  const messages = resolveAPIKeysTableMessages(
    useMessages('apiKeysTable'),
    isOrganizationId(subject) ? 'organization' : 'user',
    overrides,
  );
  const { isLoaded, isAvailable, manage, ...controller } = useAPIKeysTableController({
    subject,
    pageSize: perPage,
    showDescription,
    messages,
  });

  if (!isLoaded || !isAvailable) {
    return fallback ?? null;
  }

  return (
    <APIKeysTableView
      messages={messages}
      pageSize={perPage}
      {...controller}
      {...manage}
    />
  );
}
