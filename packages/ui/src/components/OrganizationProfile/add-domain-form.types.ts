import type { FormControlState } from '@/ui/utils/useFormControl';

export type CreatedDomainData = {
  id: string;
  isVerified: boolean;
};

export type AddDomainFormModel = {
  scope: string;
  available: boolean;
  createDomain: (name: string) => Promise<CreatedDomainData | undefined>;
  refreshDomains: () => Promise<boolean>;
};

export type AddDomainFormData = {
  wizardProps: { step: number };
  nameField: FormControlState<'name'>;
  isPending: boolean;
  canSubmit: boolean;
  domainId: string;
  verified: boolean;
  onSubmit: () => Promise<void>;
  onVerifySuccess: () => Promise<void>;
};
