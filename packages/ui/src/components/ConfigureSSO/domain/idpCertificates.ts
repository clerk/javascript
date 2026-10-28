import type { EnterpriseSamlConnectionNestedResource, EnterpriseSamlIdpCertificateResource } from '@clerk/shared/types';

export type IdpCertificateEntry = EnterpriseSamlIdpCertificateResource;

export type IdpCertificateStatus = 'expired' | 'expiring' | 'valid' | 'unknown';

export const EXPIRY_WARNING_DAYS = 30;

export const MAX_IDP_CERTIFICATES = 5;

const PEM_HEADER = '-----BEGIN CERTIFICATE-----';
const PEM_FOOTER = '-----END CERTIFICATE-----';
const BASE64_BODY = /^[A-Za-z0-9+/]+=*$/;

type SamlCertificateSource = Partial<
  Pick<
    EnterpriseSamlConnectionNestedResource,
    'idpCertificate' | 'idpCertificateIssuedAt' | 'idpCertificateExpiresAt' | 'idpCertificates'
  >
>;

/**
 * The certificates a connection trusts, primary first. A connection read
 * without `idpCertificates` only carries the single certificate and its
 * validity columns, which become one entry.
 */
export function toIdpCertificateEntries(saml: SamlCertificateSource | null | undefined): IdpCertificateEntry[] {
  if (saml?.idpCertificates?.length) {
    return saml.idpCertificates;
  }
  if (saml?.idpCertificate) {
    return [
      {
        certificate: saml.idpCertificate,
        issuedAt: saml.idpCertificateIssuedAt || null,
        expiresAt: saml.idpCertificateExpiresAt || null,
      },
    ];
  }
  return [];
}

/**
 * Splits an uploaded file into bare base64 certificate bodies: one per PEM
 * block, or the whole file when it holds a single bare base64 certificate.
 */
export function parseCertificateFile(text: string): string[] {
  const chunks = text.split(PEM_HEADER);
  const bodies: string[] = [];
  chunks.forEach((chunk, index) => {
    if (index === 0 && chunks.length > 1) {
      return;
    }
    const end = chunk.indexOf(PEM_FOOTER);
    const body = (end >= 0 ? chunk.slice(0, end) : chunk).replace(/\s+/g, '');
    if (body) {
      bodies.push(body);
    }
  });
  return bodies;
}

export function areCertificateBodies(bodies: string[]): boolean {
  return bodies.length > 0 && bodies.every(body => BASE64_BODY.test(body));
}

export function addCertificates(entries: IdpCertificateEntry[], bodies: string[]): IdpCertificateEntry[] {
  const known = new Set(entries.map(entry => entry.certificate));
  const added: IdpCertificateEntry[] = [];
  for (const certificate of bodies) {
    if (entries.length + added.length >= MAX_IDP_CERTIFICATES) {
      break;
    }
    if (!known.has(certificate)) {
      known.add(certificate);
      added.push({ certificate, issuedAt: null, expiresAt: null });
    }
  }
  return added.length > 0 ? [...entries, ...added] : entries;
}

export function removeCertificate(entries: IdpCertificateEntry[], certificate: string): IdpCertificateEntry[] {
  return entries.filter(entry => entry.certificate !== certificate);
}

export function haveCertificatesChanged(entries: IdpCertificateEntry[], original: IdpCertificateEntry[]): boolean {
  return (
    entries.length !== original.length ||
    entries.some((entry, index) => entry.certificate !== original[index].certificate)
  );
}

export function toIdpCertificatesParam(entries: IdpCertificateEntry[]): string[] {
  return entries.map(entry => entry.certificate);
}

export function getIdpCertificateStatus(entry: IdpCertificateEntry, now: number = Date.now()): IdpCertificateStatus {
  if (entry.expiresAt === null) {
    return 'unknown';
  }
  if (entry.expiresAt <= now) {
    return 'expired';
  }
  if (entry.expiresAt - now <= EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000) {
    return 'expiring';
  }
  return 'valid';
}
