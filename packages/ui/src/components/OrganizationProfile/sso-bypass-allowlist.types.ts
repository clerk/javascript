import type { AddSSOBypassAllowlistUserParams, AddSSOBypassAllowlistUsersParams } from '@clerk/shared/types';

import type { UserPreviewData } from '@/ui/elements/user-preview.view';

import type { LocalizationKey } from '../../customizables';

export type SSOBypassAllowlistPageProps = { onBack: () => void };
export type AddMode = 'email' | 'role';
export type BulkResult = { mode: AddMode; added: number; skipped: number; skippedCode: string | null };
export type FormMessage = LocalizationKey | string;
export type RoleOption = { value: string; label: string };
export type AllowlistEntry = {
  userId: string;
  preview: UserPreviewData;
  subtitle: string;
  searchText: string;
};
export type AddUsersResult = { added: number; errors: { code: string }[] };
export type AllowlistRowProps = {
  entry: AllowlistEntry;
  isCurrentUser: boolean;
  onRemove: () => void;
  isLoading: boolean;
};
export type AddMemberProps = {
  scopeKey: string;
  canRun: () => boolean;
  allowlistedUserIds: Set<string>;
  addUser: (params: AddSSOBypassAllowlistUserParams, canContinue?: () => boolean) => Promise<boolean>;
  addUsers: (
    params: AddSSOBypassAllowlistUsersParams,
    canContinue?: () => boolean,
  ) => Promise<AddUsersResult | undefined>;
};
export type AddMemberFormProps = AddMemberProps & {
  onReset: () => void;
  onResult: (result: BulkResult) => void;
};
