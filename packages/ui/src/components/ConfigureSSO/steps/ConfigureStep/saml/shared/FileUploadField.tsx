import type { FieldId } from '@clerk/shared/types';

import type { FormControlState } from '@/ui/utils/useFormControl';

import { useFileUploadFieldController } from './file-upload-field.controller';
import { useFileUploadFieldModel } from './file-upload-field.model';
import { FileUploadFieldView } from './file-upload-field.view';
import type { FileUploadLabels } from './IdentityProviderConfigurationForm';

export type FileUploadFieldProps = {
  field: FormControlState<FieldId>;
  file: File | null;
  onFileChange: (file: File | null) => void;
  existingFilePresent: boolean;
  accept?: string;
  labels: FileUploadLabels;
};

export const FileUploadField = (props: FileUploadFieldProps): JSX.Element => {
  const model = useFileUploadFieldModel(props.labels);
  const controller = useFileUploadFieldController(props, model);

  return <FileUploadFieldView {...controller} />;
};
