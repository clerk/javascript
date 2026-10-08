import { localizationKeys, useLocalizations } from '@/customizables';
import { formatDate } from '@/ui/utils/formatDate';

import {
  areCertificateBodies,
  getIdpCertificateStatus,
  type IdpCertificateEntry,
  MAX_IDP_CERTIFICATES,
  parseCertificateFile,
} from '../../../../domain/idpCertificates';

export const useCertificateListFieldModel = (certificates: IdpCertificateEntry[]) => {
  const { t } = useLocalizations();
  const certificateViews = certificates.map(entry => {
    const status = getIdpCertificateStatus(entry);
    const expiryLocalizationKey =
      entry.expiresAt === null
        ? localizationKeys('configureSSO.signingCertificates.expiryAfterSave')
        : localizationKeys(
            status === 'expired'
              ? 'configureSSO.signingCertificates.expired'
              : 'configureSSO.signingCertificates.expires',
            { date: formatDate(new Date(entry.expiresAt)) },
          );

    return { entry, status, expiryLocalizationKey };
  });

  const readCertificates = async (file: File) => {
    let text: string;
    try {
      text = await file.text();
    } catch {
      return {
        status: 'error',
        error: t(localizationKeys('configureSSO.signingCertificates.fileUnreadable')),
      } as const;
    }

    const bodies = parseCertificateFile(text);
    if (!areCertificateBodies(bodies)) {
      return {
        status: 'error',
        error: t(localizationKeys('configureSSO.signingCertificates.notACertificate')),
      } as const;
    }

    return { status: 'valid', bodies } as const;
  };

  return {
    canRemove: certificates.length > 1,
    canAdd: certificates.length < MAX_IDP_CERTIFICATES,
    certificateViews,
    removeCertificateLabel: t(localizationKeys('configureSSO.signingCertificates.removeCertificate')),
    readCertificates,
  };
};
