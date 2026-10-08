import type { APIKeysProps, FieldId } from '@clerk/shared/types';
import type { FormEvent, MutableRefObject, RefObject } from 'react';

import type { ElementDescriptor } from '@/ui/customizables/elementDescriptors';
import type { LocalizationKey } from '@/ui/localization';
import type { FormControlState } from '@/ui/utils/useFormControl';

export type APIKeyRowData = {
  id: string;
  name: string;
  createdStatus: LocalizationKey;
  lastUsed: string | LocalizationKey;
};

export type APIKeysTableData = {
  rows: Array<APIKeyRowData & { onRevoke: () => void }>;
  isLoading: boolean;
  elementDescriptor?: ElementDescriptor;
  canManageAPIKeys: boolean;
};

export type APIKeysPageProps = {
  subject: string;
  perPage?: number;
  revokeModalRoot?: MutableRefObject<HTMLElement | null>;
};

export type APIKeysProfileModel = {
  subject: string | undefined;
  apiKeysProps: APIKeysProps | undefined;
};

export type APIKeysProfileData = APIKeysProfileModel & Pick<APIKeysPageProps, 'revokeModalRoot'> & { subject: string };

export type APIKeysSearchData = {
  searchValue: string;
  setSearchValue: (value: string) => void;
  query: string;
};

export type APIKeyCreateParams = {
  name: string;
  description?: string;
  secondsUntilExpiration: number | undefined;
};

export type APIKeyRequestScope = { scopeKey: string; canRun: () => boolean };

export type APIKeysPageModel = APIKeyRequestScope & {
  rows: APIKeyRowData[];
  isLoading: boolean;
  page: number;
  pageCount: number;
  itemCount: number;
  startingRow: number;
  endingRow: number;
  canManageAPIKeys: boolean;
  searchPlaceholder: string;
  quotaErrorText: string;
  conflictErrorText: string;
  fetchPage: (page: number) => void;
  invalidateAll: () => Promise<void>;
  createAPIKey: (
    params: APIKeyCreateParams,
    canContinue?: () => boolean,
  ) => Promise<{ name: string; secret: string } | undefined>;
  getCreateErrorCode: (error: unknown) => string | undefined;
};

export type APIKeysPageData = Omit<
  APIKeysPageModel,
  | 'scopeKey'
  | 'canRun'
  | 'rows'
  | 'fetchPage'
  | 'invalidateAll'
  | 'createAPIKey'
  | 'getCreateErrorCode'
  | 'quotaErrorText'
  | 'conflictErrorText'
> & {
  rows: APIKeysTableData['rows'];
  searchValue: string;
  setSearchValue: (value: string) => void;
  onPageChange: (page: number) => void;
  handleCreateAPIKey: (params: APIKeyCreateParams) => Promise<void>;
  isCopyModalOpen: boolean;
  onOpenCopyModal: () => void;
  onCloseCopyModal: () => void;
  copyKeyName: string;
  copyKeySecret: string;
  isRevokeModalOpen: boolean;
  onOpenRevokeModal: () => void;
  onCloseRevokeModal: () => void;
  revokeKeyId: string;
  revokeKeyName: string;
  onRevokeSuccess: () => Promise<void>;
  revokeModalRoot?: MutableRefObject<HTMLElement | null>;
};

export type CopyAPIKeyModalProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  apiKeyName: string;
  apiKeySecret: string;
  modalRoot?: MutableRefObject<HTMLElement | null>;
};

export type CopyAPIKeyData = CopyAPIKeyModalProps & {
  apiKeyFieldProps: FormControlState<'apiKeySecret'>['props'];
  handleSubmit: () => void;
};

export type RevokeAPIKeyConfirmationModalProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  apiKeyID?: string;
  apiKeyName: string;
  onRevokeSuccess?: () => void | Promise<void>;
  modalRoot?: MutableRefObject<HTMLElement | null>;
};

export type RevokeAPIKeyModel = APIKeyRequestScope & {
  confirmationText: string;
  revoke: (id: string, canContinue?: () => boolean) => Promise<boolean>;
};

export type APIKeyFormField<Id extends FieldId> = Pick<FormControlState<Id>, 'id' | 'props'>;

export type RevokeAPIKeyData = Pick<
  RevokeAPIKeyConfirmationModalProps,
  'isOpen' | 'onOpen' | 'apiKeyName' | 'modalRoot'
> & {
  handleClose: () => void;
  revokeField: APIKeyFormField<'apiKeyRevokeConfirmation'>;
  canSubmit: boolean;
  handleSubmit: (event: FormEvent) => Promise<void>;
};

export type Expiration = 'never' | '1d' | '7d' | '30d' | '60d' | '90d' | '180d' | '1y';
export type ExpirationOption = { value: Expiration; label: string };
export type CreateAPIKeyFormProps = { onCreate: (params: APIKeyCreateParams) => void | Promise<void> };

export type CreateAPIKeyModel = {
  showDescription: boolean;
  expirationOptions: ExpirationOption[];
  expirationPlaceholder: string;
  expirationCaption: (expiration?: Expiration) => string;
};

export type CreateAPIKeyData = Omit<CreateAPIKeyModel, 'expirationCaption'> & {
  nameField: APIKeyFormField<'name'>;
  descriptionField: APIKeyFormField<'apiKeyDescription'>;
  selectedExpiration: ExpirationOption | null;
  setSelectedExpiration: (expiration: ExpirationOption | null) => void;
  expirationButtonRef: RefObject<HTMLButtonElement>;
  expirationCaption: string;
  canSubmit: boolean;
  isLoading: boolean;
  closeCard: () => void;
  handleSubmit: (event: FormEvent) => Promise<void>;
};
