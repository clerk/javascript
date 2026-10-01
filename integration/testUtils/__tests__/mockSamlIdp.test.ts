import { createHash, createVerify, X509Certificate } from 'node:crypto';
import { deflateRawSync } from 'node:zlib';

import { describe, expect, it } from 'vitest';

import { createMockSamlIdp, parseAuthnRequest } from '../mockSamlIdp';

const acsUrl = 'https://clerk.example.dev/v1/saml/acs/conn_123?a=1&b=2';
const audience = 'https://clerk.example.dev/saml/conn_123';

function verifyAssertion(samlResponse: string, certificate: string) {
  const xml = Buffer.from(samlResponse, 'base64').toString('utf8');
  const signature = xml.match(/<Signature xmlns="[^"]+">.*<\/Signature>/)?.[0] ?? '';
  const signedInfo = signature.match(/<SignedInfo .*<\/SignedInfo>/)?.[0] ?? '';
  const signatureValue = signature.match(/<SignatureValue>([^<]+)</)?.[1] ?? '';
  const digestValue = signedInfo.match(/<DigestValue>([^<]+)</)?.[1];
  const assertion = (xml.match(/<saml:Assertion .*<\/saml:Assertion>/)?.[0] ?? '').replace(signature, '');

  const publicKey = new X509Certificate(Buffer.from(certificate, 'base64')).publicKey;
  return {
    digestMatches: createHash('sha256').update(assertion).digest('base64') === digestValue,
    signatureValid: createVerify('RSA-SHA256').update(signedInfo).verify(publicKey, signatureValue, 'base64'),
  };
}

describe('createMockSamlIdp', () => {
  const idp = createMockSamlIdp({ host: 'fake-idp.e2e-test.dev' });

  it('issues a valid self-signed certificate for the IdP host', () => {
    const cert = new X509Certificate(Buffer.from(idp.certificate, 'base64'));
    expect(cert.subject).toBe('CN=fake-idp.e2e-test.dev');
    expect(cert.verify(cert.publicKey)).toBe(true);
    expect(new Date(cert.validTo).getTime()).toBeGreaterThan(Date.now());
  });

  it('signs the assertion with the certificate key', () => {
    const samlResponse = idp.buildResponse({ acsUrl, audience, inResponseTo: '_req', email: 'jane@e2e-test.dev' });
    expect(verifyAssertion(samlResponse, idp.certificate)).toEqual({ digestMatches: true, signatureValid: true });
  });

  it('produces a digest mismatch when the assertion is tampered with', () => {
    const xml = Buffer.from(idp.buildResponse({ acsUrl, audience, email: 'jane@e2e-test.dev' }), 'base64').toString();
    const tampered = Buffer.from(xml.replace('>jane@e2e-test.dev</saml:NameID>', '>admin@e2e-test.dev</saml:NameID>'));
    expect(verifyAssertion(tampered.toString('base64'), idp.certificate).digestMatches).toBe(false);
  });

  it('escapes special characters in user attributes', () => {
    const xml = Buffer.from(
      idp.buildResponse({ acsUrl, audience, email: 'jane@e2e-test.dev', firstName: `O'Brien & <Co>` }),
      'base64',
    ).toString();
    expect(xml).toContain("<saml:AttributeValue>O'Brien &amp; &lt;Co&gt;</saml:AttributeValue>");
    expect(xml).toContain('Recipient="https://clerk.example.dev/v1/saml/acs/conn_123?a=1&amp;b=2"');
  });
});

describe('parseAuthnRequest', () => {
  it('reads the request ID, ACS URL, and issuer from a redirect-binding AuthnRequest', () => {
    const xml =
      '<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="_abc" Version="2.0" ' +
      'AssertionConsumerServiceURL="https://clerk.example.dev/acs?x=1&amp;y=2">' +
      '<saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">https://clerk.example.dev/sp</saml:Issuer>' +
      '</samlp:AuthnRequest>';
    expect(parseAuthnRequest(deflateRawSync(xml).toString('base64'))).toEqual({
      id: '_abc',
      acsUrl: 'https://clerk.example.dev/acs?x=1&y=2',
      issuer: 'https://clerk.example.dev/sp',
    });
  });
});
