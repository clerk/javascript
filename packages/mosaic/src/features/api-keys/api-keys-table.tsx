import { isOrganizationId } from '@clerk/shared/internal/clerk-js/organization';
import type { ReactNode } from 'react';

import { useMessages } from '../../localization';
import { useAPIKeysTableController } from './api-keys-table.controller';
import { resolveAPIKeysTableMessages } from './api-keys-table.messages';
import { PAGE_SIZE } from './api-keys-table.model';
import { APIKeysTableSkeleton } from './api-keys-table.skeleton';
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
  perPage,
  showDescription = false,
  messages: overrides,
  fallback,
}: APIKeysTableProps) {
  const messages = resolveAPIKeysTableMessages(
    useMessages('apiKeysTable'),
    isOrganizationId(subject) ? 'organization' : 'user',
    overrides,
  );
  const pageSize = perPage !== undefined && Number.isInteger(perPage) && perPage > 0 ? perPage : PAGE_SIZE;
  const { isLoaded, isAvailable, isLoading, manage, ...controller } = useAPIKeysTableController({
    subject,
    pageSize,
    showDescription,
    messages,
  });

  if (!isLoaded || !isAvailable) {
    return fallback ?? null;
  }
  if (isLoading) {
    return (
      <APIKeysTableSkeleton
        messages={messages}
        canManage={Boolean(manage)}
      />
    );
  }

  return (
    <APIKeysTableView
      messages={messages}
      pageSize={pageSize}
      {...controller}
      {...manage}
    />
  );
}
