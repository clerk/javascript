import { useRef } from 'react';

import type { useFileUploadFieldModel } from './file-upload-field.model';
import type { FileUploadFieldProps } from './FileUploadField';

export const useFileUploadFieldController = (
  props: FileUploadFieldProps,
  model: ReturnType<typeof useFileUploadFieldModel>,
) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onFileChange(event.target.files?.[0] ?? null);
    props.field.clearFeedback();
  };

  const onRemove = () => {
    props.onFileChange(null);
    props.field.clearFeedback();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return {
    ...props,
    ...model,
    inputRef,
    onInputChange,
    onOpenPicker: () => inputRef.current?.click(),
    onRemove,
  };
};
