import { useLocalizations } from '@/customizables';

import type { FileUploadLabels } from './IdentityProviderConfigurationForm';

export const useFileUploadFieldModel = (labels: FileUploadLabels) => {
  const { t } = useLocalizations();

  return { removeFileLabel: t(labels.removeFile) };
};
