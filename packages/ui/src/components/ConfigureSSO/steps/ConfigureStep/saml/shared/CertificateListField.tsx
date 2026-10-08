import type { FieldId } from '@clerk/shared/types';
import type React from 'react';

import type { FormControlState } from '@/ui/utils/useFormControl';

import type { IdpCertificateEntry } from '../../../../domain/idpCertificates';
import { useCertificateListFieldController } from './certificate-list-field.controller';
import { useCertificateListFieldModel } from './certificate-list-field.model';
import { CertificateListFieldView } from './certificate-list-field.view';
import type { FileUploadLabels } from './IdentityProviderConfigurationForm';

export type CertificateListFieldProps = {
  field: FormControlState<FieldId>;
  certificates: IdpCertificateEntry[];
  onCertificatesChange: React.Dispatch<React.SetStateAction<IdpCertificateEntry[]>>;
  labels: FileUploadLabels;
};

export const CertificateListField = (props: CertificateListFieldProps): JSX.Element => {
  const model = useCertificateListFieldModel(props.certificates);
  const controller = useCertificateListFieldController(props, model);

  return <CertificateListFieldView {...controller} />;
};
