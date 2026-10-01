import type { KeyObject } from 'node:crypto';
import { createHash, createSign, generateKeyPairSync, randomBytes, randomUUID, sign } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';

import type { Page } from '@playwright/test';

const DSIG_NS = 'http://www.w3.org/2000/09/xmldsig#';
const EXC_C14N = 'http://www.w3.org/2001/10/xml-exc-c14n#';

export const mockSamlIdpAttributeMapping = {
  emailAddress: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
};

export type MockSamlUser = {
  email: string;
  firstName?: string;
  lastName?: string;
};

type BuildResponseParams = MockSamlUser & {
  acsUrl: string;
  audience: string;
  inResponseTo?: string;
};

const der = {
  tlv(tag: number, value: Buffer) {
    const len = value.length;
    const header =
      len < 0x80 ? Buffer.from([len]) : Buffer.from([0x80 | Math.ceil(len.toString(16).length / 2), ...bigEndian(len)]);
    return Buffer.concat([Buffer.from([tag]), header, value]);
  },
  seq: (...items: Buffer[]) => der.tlv(0x30, Buffer.concat(items)),
  set: (...items: Buffer[]) => der.tlv(0x31, Buffer.concat(items)),
  int: (value: Buffer) => der.tlv(0x02, value[0] & 0x80 ? Buffer.concat([Buffer.from([0]), value]) : value),
  oid(dotted: string) {
    const [a, b, ...rest] = dotted.split('.').map(Number);
    const bytes = [40 * a + b];
    for (const n of rest) {
      const chunk = [n & 0x7f];
      for (let v = n >> 7; v > 0; v >>= 7) {
        chunk.unshift(0x80 | (v & 0x7f));
      }
      bytes.push(...chunk);
    }
    return der.tlv(0x06, Buffer.from(bytes));
  },
  utf8: (s: string) => der.tlv(0x0c, Buffer.from(s, 'utf8')),
  utcTime: (d: Date) => der.tlv(0x17, Buffer.from(d.toISOString().replace(/[-:T]/g, '').slice(2, 14) + 'Z', 'ascii')),
  bitString: (value: Buffer) => der.tlv(0x03, Buffer.concat([Buffer.from([0]), value])),
  explicit0: (value: Buffer) => der.tlv(0xa0, value),
  null: () => Buffer.from([0x05, 0x00]),
};

function bigEndian(n: number) {
  const bytes: number[] = [];
  for (let v = n; v > 0; v = Math.floor(v / 256)) {
    bytes.unshift(v & 0xff);
  }
  return bytes;
}

function selfSignedCertificate(commonName: string, privateKey: KeyObject, publicKey: KeyObject) {
  const sha256WithRsa = der.seq(der.oid('1.2.840.113549.1.1.11'), der.null());
  const name = der.seq(der.set(der.seq(der.oid('2.5.4.3'), der.utf8(commonName))));
  const now = Date.now();
  const tbs = der.seq(
    der.explicit0(der.int(Buffer.from([2]))),
    der.int(randomBytes(16)),
    sha256WithRsa,
    name,
    der.seq(der.utcTime(new Date(now - 60 * 60_000)), der.utcTime(new Date(now + 365 * 24 * 60 * 60_000))),
    name,
    publicKey.export({ type: 'spki', format: 'der' }),
  );
  return der.seq(tbs, sha256WithRsa, der.bitString(sign('sha256', tbs, privateKey))).toString('base64');
}

const escapeText = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r/g, '&#xD;');

const escapeAttr = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/\t/g, '&#x9;')
    .replace(/\n/g, '&#xA;')
    .replace(/\r/g, '&#xD;');

const isNamespaceDecl = (name: string) => name === 'xmlns' || name.startsWith('xmlns:');
const byName = ([a]: [string, string], [b]: [string, string]) => (a < b ? -1 : 1);

function el(name: string, attrs: Record<string, string | undefined>, ...children: string[]) {
  const defined = Object.entries(attrs).filter((entry): entry is [string, string] => entry[1] !== undefined);
  const ordered = [
    ...defined.filter(([k]) => isNamespaceDecl(k)).sort(byName),
    ...defined.filter(([k]) => !isNamespaceDecl(k)).sort(byName),
  ];
  return `<${name}${ordered.map(([k, v]) => ` ${k}="${escapeAttr(v)}"`).join('')}>${children.join('')}</${name}>`;
}

const decodeEntities = (s: string) =>
  s.replace(
    /&(lt|gt|quot|apos|amp);/g,
    (_, e: string) => ({ lt: '<', gt: '>', quot: '"', apos: "'", amp: '&' })[e] as string,
  );

export function parseAuthnRequest(samlRequest: string) {
  const xml = inflateRawSync(Buffer.from(samlRequest, 'base64')).toString('utf8');
  const root = xml.match(/<(?:\w+:)?AuthnRequest\b[^>]*>/)?.[0] ?? '';
  const rootAttr = (name: string) => {
    const value = root.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
    return value === undefined ? undefined : decodeEntities(value);
  };
  const issuer = xml.match(/<(?:\w+:)?Issuer\b[^>]*>([^<]*)<\//)?.[1];
  return {
    id: rootAttr('ID'),
    acsUrl: rootAttr('AssertionConsumerServiceURL'),
    issuer: issuer === undefined ? undefined : decodeEntities(issuer.trim()),
  };
}

export function createMockSamlIdp({ host }: { host: string }) {
  const entityId = `https://${host}`;
  const ssoUrl = `https://${host}/sso`;
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const certificate = selfSignedCertificate(host, privateKey, publicKey);

  function signAssertion(assertionId: string, canonicalAssertion: string) {
    const signedInfo = el(
      'SignedInfo',
      { xmlns: DSIG_NS },
      el('CanonicalizationMethod', { Algorithm: EXC_C14N }),
      el('SignatureMethod', { Algorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256' }),
      el(
        'Reference',
        { URI: `#${assertionId}` },
        el(
          'Transforms',
          {},
          el('Transform', { Algorithm: `${DSIG_NS}enveloped-signature` }),
          el('Transform', { Algorithm: EXC_C14N }),
        ),
        el('DigestMethod', { Algorithm: 'http://www.w3.org/2001/04/xmlenc#sha256' }),
        el('DigestValue', {}, createHash('sha256').update(canonicalAssertion).digest('base64')),
      ),
    );
    return el(
      'Signature',
      { xmlns: DSIG_NS },
      signedInfo,
      el('SignatureValue', {}, createSign('RSA-SHA256').update(signedInfo).sign(privateKey, 'base64')),
      el('KeyInfo', {}, el('X509Data', {}, el('X509Certificate', {}, certificate))),
    );
  }

  function buildResponse({ acsUrl, audience, inResponseTo, ...user }: BuildResponseParams) {
    const now = Date.now();
    const iso = (ms: number) => new Date(ms).toISOString();
    const assertionId = `_${randomUUID()}`;
    const notOnOrAfter = iso(now + 5 * 60_000);
    const attributes = {
      [mockSamlIdpAttributeMapping.emailAddress]: user.email,
      [mockSamlIdpAttributeMapping.firstName]: user.firstName,
      [mockSamlIdpAttributeMapping.lastName]: user.lastName,
    };

    const issuer = el('saml:Issuer', {}, escapeText(entityId));
    const body = [
      el(
        'saml:Subject',
        {},
        el('saml:NameID', { Format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress' }, escapeText(user.email)),
        el(
          'saml:SubjectConfirmation',
          { Method: 'urn:oasis:names:tc:SAML:2.0:cm:bearer' },
          el('saml:SubjectConfirmationData', {
            InResponseTo: inResponseTo,
            NotOnOrAfter: notOnOrAfter,
            Recipient: acsUrl,
          }),
        ),
      ),
      el(
        'saml:Conditions',
        { NotBefore: iso(now - 60_000), NotOnOrAfter: notOnOrAfter },
        el('saml:AudienceRestriction', {}, el('saml:Audience', {}, escapeText(audience))),
      ),
      el(
        'saml:AuthnStatement',
        { AuthnInstant: iso(now), SessionIndex: assertionId },
        el(
          'saml:AuthnContext',
          {},
          el('saml:AuthnContextClassRef', {}, 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport'),
        ),
      ),
      el(
        'saml:AttributeStatement',
        {},
        ...Object.entries(attributes)
          .filter((entry): entry is [string, string] => entry[1] !== undefined)
          .map(([name, value]) =>
            el('saml:Attribute', { Name: name }, el('saml:AttributeValue', {}, escapeText(value))),
          ),
      ),
    ];
    const assertionAttrs = {
      'xmlns:saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
      ID: assertionId,
      IssueInstant: iso(now),
      Version: '2.0',
    };
    const unsigned = el('saml:Assertion', assertionAttrs, issuer, ...body);
    const signed = el('saml:Assertion', assertionAttrs, issuer, signAssertion(assertionId, unsigned), ...body);

    const response = el(
      'samlp:Response',
      {
        'xmlns:samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
        'xmlns:saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
        ID: `_${randomUUID()}`,
        Version: '2.0',
        IssueInstant: iso(now),
        Destination: acsUrl,
        InResponseTo: inResponseTo,
      },
      el('saml:Issuer', {}, escapeText(entityId)),
      el('samlp:Status', {}, el('samlp:StatusCode', { Value: 'urn:oasis:names:tc:SAML:2.0:status:Success' })),
      signed,
    );
    return Buffer.from(response).toString('base64');
  }

  function autoPostHtml({
    acsUrl,
    samlResponse,
    relayState,
  }: {
    acsUrl: string;
    samlResponse: string;
    relayState?: string | null;
  }) {
    const relay = relayState ? `<input type="hidden" name="RelayState" value="${escapeAttr(relayState)}">` : '';
    return `<!doctype html><form id="saml" method="POST" action="${escapeAttr(acsUrl)}"><input type="hidden" name="SAMLResponse" value="${samlResponse}">${relay}</form><script>document.getElementById('saml').submit()</script>`;
  }

  async function signInWith(page: Page, user: MockSamlUser) {
    await page.route(
      url => url.host === host && url.pathname === '/sso',
      async route => {
        const url = new URL(route.request().url());
        const request = parseAuthnRequest(url.searchParams.get('SAMLRequest') ?? '');
        if (!request.acsUrl || !request.issuer) {
          throw new Error(`Mock SAML IdP received an AuthnRequest without an ACS URL or issuer: ${url.href}`);
        }
        const samlResponse = buildResponse({
          acsUrl: request.acsUrl,
          audience: request.issuer,
          inResponseTo: request.id,
          ...user,
        });
        await route.fulfill({
          contentType: 'text/html',
          body: autoPostHtml({ acsUrl: request.acsUrl, samlResponse, relayState: url.searchParams.get('RelayState') }),
        });
      },
    );
  }

  async function postIdpInitiated(page: Page, params: MockSamlUser & { acsUrl: string; audience: string }) {
    await page.setContent(autoPostHtml({ acsUrl: params.acsUrl, samlResponse: buildResponse(params) }));
  }

  return { entityId, ssoUrl, certificate, buildResponse, signInWith, postIdpInitiated };
}
