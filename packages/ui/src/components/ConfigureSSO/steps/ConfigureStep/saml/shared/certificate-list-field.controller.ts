import { useRef } from 'react';

import { addCertificates, removeCertificate } from '../../../../domain/idpCertificates';
import type { useCertificateListFieldModel } from './certificate-list-field.model';
import type { CertificateListFieldProps } from './CertificateListField';

export const useCertificateListFieldController = (
  props: CertificateListFieldProps,
  model: ReturnType<typeof useCertificateListFieldModel>,
) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFileSelected = async (file: File | null): Promise<void> => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (!file) {
      return;
    }

    const result = await model.readCertificates(file);
    if (result.status === 'error') {
      props.field.setError(result.error);
      return;
    }

    props.field.clearFeedback();
    props.onCertificatesChange(current => addCertificates(current, result.bodies));
  };

  const onRemove = (certificate: string) => {
    props.field.clearFeedback();
    props.onCertificatesChange(current => removeCertificate(current, certificate));
  };

  return {
    ...props,
    ...model,
    inputRef,
    onFileSelected,
    onOpenPicker: () => inputRef.current?.click(),
    onRemove,
  };
};
