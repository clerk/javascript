import type { OrganizationEnrollmentMode } from '@clerk/shared/types';

import type { LocalizationKey } from '@/customizables';
import type { FormControlState } from '@/ui/utils/useFormControl';

export type VerifiedDomainFormModel = {
  scope: string;
  canRun: () => boolean;
  available: boolean;
  isLoading: boolean;
  errorMessage?: string;
  retry: () => void;
  domain: {
    id: string;
    name: string;
    enrollmentMode: OrganizationEnrollmentMode;
    isVerified: boolean;
    totalPendingInvitations: number;
    totalPendingSuggestions: number;
  } | null;
  enrollmentModes: OrganizationEnrollmentMode[];
  updateEnrollmentMode: (
    mode: OrganizationEnrollmentMode,
    deletePending: boolean | undefined,
    canContinue?: () => boolean,
  ) => Promise<boolean>;
};

export type VerifiedDomainFormData = {
  enrollmentMode: FormControlState<'enrollmentMode'>;
  deletePending: FormControlState<'deleteExistingInvitationsSuggestions'>;
  calloutLabels: LocalizationKey[];
  allowsEdit: boolean;
  isLoading: boolean;
  errorMessage?: string;
  retry: () => void;
  domainName: string;
  updateEnrollmentMode: () => Promise<void>;
};
