import { isOrganizationId } from '@clerk/shared/internal/clerk-js/organization';
import type { ReactNode } from 'react';

import { useMessages } from '../../localization';
import { useAPIKeysTableController } from './api-keys-table.controller';
import { resolveAPIKeysTableMessages } from './api-keys-table.messages';
import { PAGE_SIZE, useAPIKeysTableModel } from './api-keys-table.model';
import type { APIKeysTableMessages } from './api-keys-table.types';
import { APIKeysTableView } from './api-keys-table.view';

export interface APIKeysTableProps {
  subject: string;
  messages?: Partial<APIKeysTableMessages>;
  fallback?: ReactNode;
}

export function APIKeysTable(props: APIKeysTableProps) {
  return (
    <SubjectAPIKeysTable
      key={props.subject}
      {...props}
    />
  );
}

function SubjectAPIKeysTable({ subject, messages: overrides, fallback }: APIKeysTableProps) {
  const messages = resolveAPIKeysTableMessages(
    useMessages('apiKeysTable'),
    isOrganizationId(subject) ? 'organization' : 'user',
    overrides,
  );
  const model = useAPIKeysTableModel(subject, messages);
  const { isLoaded, isAvailable, manage, ...controller } = useAPIKeysTableController(model, messages);

  if (!isLoaded || !isAvailable) {
    return fallback ?? null;
  }

  return (
    <APIKeysTableView
      messages={messages}
      pageSize={PAGE_SIZE}
      {...controller}
      {...manage}
    />
  );
}
