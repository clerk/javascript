import type { APIKeyResource } from '@clerk/shared/types';
import type { MouseEventHandler, Ref } from 'react';

import type { ConfirmController } from '../../blocks/confirm';
import type { DialogFocusTarget } from '../../components/dialog';
import type { MosaicMessages } from '../../localization';
import type { CreateAPIKeyDialogProps } from './create-api-key.dialog';

export type APIKeyRecord = Pick<APIKeyResource, 'id' | 'name' | 'createdAt' | 'expiration' | 'lastUsedAt'>;

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
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange: (value: string) => void;
  searchInputRef?: Ref<HTMLInputElement>;
  createButtonRef?: Ref<HTMLButtonElement>;
  onCreate?: MouseEventHandler<HTMLButtonElement>;
  createDialog?: CreateAPIKeyDialogProps;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  revoke?: ConfirmController<APIKey>;
  finalFocus?: DialogFocusTarget;
  onBulkAction?: (ids: string[]) => void;
  sort?: APIKeysTableSort | null;
  onSortChange?: (sort: APIKeysTableSort | null) => void;
}
