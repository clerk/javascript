import { useState } from 'react';

import type { UseFormResult } from '../../../components/form';
import { useForm } from '../../../components/form';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import { addCertificates, MAX_CERTIFICATES, parseCertificateFile } from './sso-certificates.utils';
import type {
  SSOConnectionSetting,
  SSOOidcDetails,
  SSOOidcValues,
  SSOSamlDetails,
  SSOSamlValues,
} from './sso-connections.types';

interface EditDialogController<TValues extends object> {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormResult<TValues>;
}

function useEditDialog<TValues extends object>({
  initialValues,
  canSubmit,
  onSubmit,
  onOpen,
}: {
  initialValues: TValues;
  canSubmit: (values: TValues) => boolean;
  onSubmit: (values: TValues) => Promise<void>;
  onOpen?: () => void;
}): EditDialogController<TValues> {
  const m = useMessages('organizationProfile').security;
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<TValues, void>({
    initialValues,
    errorFallback: m.errorFallback,
    canSubmit,
    onSubmit,
    onSuccess: () => setIsOpen(false),
  });

  return {
    isOpen,
    form,
    onOpenChange: open => {
      if (!open && form.isSubmitting) {
        return;
      }
      form.reset(initialValues);
      onOpen?.();
      setIsOpen(open);
    },
  };
}

export type SSORenameController = EditDialogController<{ name: string }>;

export function useSSORenameController({
  name,
  onSubmit,
}: {
  name: string;
  onSubmit: (name: string) => Promise<void>;
}): SSORenameController {
  return useEditDialog({
    initialValues: { name },
    canSubmit: values => values.name.trim() !== '' && values.name.trim() !== name,
    onSubmit: values => onSubmit(values.name),
  });
}

export interface SSOSamlEditController extends EditDialogController<SSOSamlValues> {
  canAddCertificate: boolean;
  canRemoveCertificate: boolean;
  certificateError: string | undefined;
  onCertificateFiles: (files: File[]) => void;
  onRemoveCertificate: (certificate: string) => void;
}

export function useSSOSamlEditController({
  saml,
  onSubmit,
}: {
  saml: SSOSamlDetails;
  onSubmit: (values: SSOSamlValues) => Promise<void>;
}): SSOSamlEditController {
  const m = useMessages('organizationProfile').security.ssoConnection.identityProviderDialog;
  const [certificateError, setCertificateError] = useState<string>();
  const dialog = useEditDialog<SSOSamlValues>({
    initialValues: {
      mode: saml.idpMetadataUrl ? 'metadataUrl' : 'manual',
      idpMetadataUrl: saml.idpMetadataUrl,
      idpSsoUrl: saml.idpSsoUrl,
      idpEntityId: saml.idpEntityId,
      certificates: saml.certificates,
    },
    canSubmit: values =>
      values.mode === 'metadataUrl'
        ? values.idpMetadataUrl.trim() !== ''
        : values.idpSsoUrl.trim() !== '' && values.idpEntityId.trim() !== '' && values.certificates.length > 0,
    onSubmit,
    onOpen: () => setCertificateError(undefined),
  });
  const { form } = dialog;
  const certificates = form.values.certificates;

  return {
    ...dialog,
    canAddCertificate: certificates.length < MAX_CERTIFICATES,
    canRemoveCertificate: certificates.length > 1,
    certificateError,
    onCertificateFiles: files => {
      const [file] = files;
      if (!file) {
        return;
      }
      setCertificateError(undefined);
      file.text().then(
        text => {
          const bodies = parseCertificateFile(text);
          if (!bodies) {
            setCertificateError(m.notACertificate);
            return;
          }
          form.setValue('certificates', addCertificates(form.values.certificates, bodies));
        },
        () => setCertificateError(m.fileUnreadable),
      );
    },
    onRemoveCertificate: certificate => {
      setCertificateError(undefined);
      form.setValue(
        'certificates',
        certificates.filter(entry => entry.certificate !== certificate),
      );
    },
  };
}

export type SSOOidcEditController = EditDialogController<SSOOidcValues>;

export function useSSOOidcEditController({
  oidc,
  onSubmit,
}: {
  oidc: SSOOidcDetails;
  onSubmit: (values: SSOOidcValues) => Promise<void>;
}): SSOOidcEditController {
  return useEditDialog<SSOOidcValues>({
    initialValues: {
      mode: oidc.discoveryUrl ? 'discoveryUrl' : 'manual',
      clientId: oidc.clientId,
      clientSecret: '',
      discoveryUrl: oidc.discoveryUrl,
      authUrl: oidc.authUrl,
      tokenUrl: oidc.tokenUrl,
      userInfoUrl: oidc.userInfoUrl,
    },
    canSubmit: values =>
      values.clientId.trim() !== '' &&
      (values.mode === 'discoveryUrl'
        ? values.discoveryUrl.trim() !== ''
        : values.authUrl.trim() !== '' && values.tokenUrl.trim() !== ''),
    onSubmit,
  });
}

export interface SSOSettingRow {
  id: SSOConnectionSetting;
  checked: boolean;
  isPending: boolean;
  error: string | undefined;
}

export interface SSOSettingsController {
  rows: SSOSettingRow[];
  isDisabled: boolean;
  onCheckedChange: (id: SSOConnectionSetting, checked: boolean) => void;
}

const SETTING_ORDER: SSOConnectionSetting[] = [
  'syncUserAttributes',
  'allowAdditionalIdentifiers',
  'allowSubdomains',
  'allowIdpInitiated',
  'forceAuthn',
];

export function useSSOSettingsController({
  settings,
  onChange,
}: {
  settings: Partial<Record<SSOConnectionSetting, boolean>>;
  onChange: (setting: SSOConnectionSetting, enabled: boolean) => Promise<void>;
}): SSOSettingsController {
  const m = useMessages('organizationProfile').security;
  const actions = usePendingAction<SSOConnectionSetting>({ errorFallback: m.errorFallback });

  return {
    rows: SETTING_ORDER.flatMap(id => {
      const checked = settings[id];
      const isPending = actions.pendingKey === id;
      return checked === undefined
        ? []
        : [
            {
              id,
              checked: isPending ? !checked : checked,
              isPending,
              error: actions.errorKey === id ? actions.error : undefined,
            },
          ];
    }),
    isDisabled: actions.isPending,
    onCheckedChange: (id, checked) => void actions.run(id, () => onChange(id, checked)),
  };
}
