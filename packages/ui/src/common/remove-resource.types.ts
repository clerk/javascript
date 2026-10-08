import type { FormProps } from '../elements/FormContainer';
import type { LocalizationKey } from '../localization';

export type RemoveFormData = FormProps & {
  title: LocalizationKey;
  messageLine1: LocalizationKey;
  messageLine2?: LocalizationKey;
  successMessage?: LocalizationKey;
};

export type RemoveFormProps = RemoveFormData & {
  scopeKey?: string;
  canRun?: () => boolean;
  deleteResource: (canContinue?: () => boolean) => Promise<unknown>;
};

export type RemoveResourceModel = {
  scopeKey: string;
  canRun: () => boolean;
  deleteResource: (canContinue?: () => boolean) => Promise<boolean>;
};

export type RemoveResourceData = Pick<RemoveFormData, 'title' | 'messageLine1' | 'messageLine2' | 'onReset'> & {
  handleSubmit: () => Promise<void>;
};
