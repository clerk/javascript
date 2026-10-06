import type { MouseEventHandler } from 'react';

import type { MosaicMessages } from '../../localization';
import type { CreateAPIKeyDialogProps } from './create-api-key.dialog';

export interface APIKey {
  id: string;
  name: string;
  createdAtLabel: string;
  expiresAtLabel: string | null;
  lastUsedAtLabel: string | null;
}

export interface APIKeysTableSort {
  column: 'name' | 'createdAt' | 'lastUsed';
  direction: 'ascending' | 'descending';
}

export type APIKeysTableSubjectKind = 'user' | 'organization';

type Strings<T> = { readonly [K in keyof T]: T[K] extends string ? string : Strings<T[K]> };

export type APIKeysTableMessages = Strings<Omit<MosaicMessages['apiKeysTable'], 'noKeysDescription'>> & {
  readonly noKeysDescription: string;
};

export interface APIKeysTableViewProps {
  messages: APIKeysTableMessages;
  apiKeys: APIKey[];
  totalCount: number;
  page: number;
  pageSize?: number;
  searchValue: string;
  isLoading: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange: (value: string) => void;
  onCreate?: MouseEventHandler<HTMLButtonElement>;
  createDialog?: CreateAPIKeyDialogProps;
  onRevoke?: (id: string) => Promise<void>;
  onBulkAction?: (ids: string[]) => void;
  sort?: APIKeysTableSort | null;
  onSortChange?: (sort: APIKeysTableSort | null) => void;
  skeleton?: boolean;
  refetchSkeleton?: boolean;
}
