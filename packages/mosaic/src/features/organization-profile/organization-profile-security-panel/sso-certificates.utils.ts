import type { SSOCertificate, SSOCertificateStatus } from './sso-connections.types';

export const MAX_CERTIFICATES = 5;
export const CERTIFICATE_FILE_TYPES = '.pem,.key,.crt,.cer,.cert';

const EXPIRY_WARNING_MS = 30 * 24 * 60 * 60 * 1000;
const PEM_HEADER = '-----BEGIN CERTIFICATE-----';
const PEM_FOOTER = '-----END CERTIFICATE-----';
const BASE64_BODY = /^[A-Za-z0-9+/]+=*$/;

export function parseCertificateFile(text: string): string[] | undefined {
  const chunks = text.split(PEM_HEADER);
  const bodies = chunks.flatMap((chunk, index) => {
    if (index === 0 && chunks.length > 1) {
      return [];
    }
    const end = chunk.indexOf(PEM_FOOTER);
    const body = (end >= 0 ? chunk.slice(0, end) : chunk).replace(/\s+/g, '');
    return body ? [body] : [];
  });
  return bodies.length > 0 && bodies.every(body => BASE64_BODY.test(body)) ? bodies : undefined;
}

export function addCertificates(certificates: SSOCertificate[], bodies: string[]): SSOCertificate[] {
  const known = new Set(certificates.map(entry => entry.certificate));
  const added: SSOCertificate[] = [];
  for (const certificate of bodies) {
    if (certificates.length + added.length >= MAX_CERTIFICATES) {
      break;
    }
    if (!known.has(certificate)) {
      known.add(certificate);
      added.push({ certificate, expiresAt: null });
    }
  }
  return added.length > 0 ? [...certificates, ...added] : certificates;
}

export function haveCertificatesChanged(certificates: SSOCertificate[], original: SSOCertificate[]): boolean {
  return (
    certificates.length !== original.length ||
    certificates.some((entry, index) => entry.certificate !== original[index]?.certificate)
  );
}

export function certificateStatus(certificate: SSOCertificate, now: number): SSOCertificateStatus {
  if (certificate.expiresAt === null) {
    return 'unknown';
  }
  if (certificate.expiresAt <= now) {
    return 'expired';
  }
  return certificate.expiresAt - now <= EXPIRY_WARNING_MS ? 'expiring' : 'valid';
}

export function earliestExpiring(certificates: SSOCertificate[]): SSOCertificate | undefined {
  return certificates
    .filter(entry => entry.expiresAt !== null)
    .reduce<
      SSOCertificate | undefined
    >((earliest, entry) => (!earliest || (entry.expiresAt ?? 0) < (earliest.expiresAt ?? 0) ? entry : earliest), undefined);
}
