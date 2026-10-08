import type { UserPreviewData } from '@/ui/elements/user-preview.view';
import type { CustomPageContent } from '@/ui/utils/createCustomPages';

export type ProfileSectionModel<Data> = { status: 'hidden' } | ({ status: 'ready' } & Data);

export type UsernameSectionData = {
  username: string | null;
  isImmutable: boolean;
};

export type PasswordSectionData = {
  passwordEnabled: boolean;
};

export type UserProfileSectionData = {
  preview: UserPreviewData;
};

export type UserProfileRoutesData = {
  isAccountPageRoot: boolean;
  isSecurityPageRoot: boolean;
  isBillingPageRoot: boolean;
  isAPIKeysPageRoot: boolean;
  customPages: CustomPageContent[];
  showBilling: boolean;
  hasPaidPlans: boolean;
  showAPIKeys: boolean;
};
