import { github } from './glyphs/github.generated';
import { gitlab } from './glyphs/gitlab.generated';
import { google } from './glyphs/google.generated';
import { microsoft } from './glyphs/microsoft.generated';
import { okta } from './glyphs/okta.generated';
import type { ProviderLogoGlyph } from './provider-logo.types';

export const enterpriseLogos = {
  saml_google: google,
  oauth_google: google,
  saml_microsoft: microsoft,
  oauth_microsoft: microsoft,
  oidc_github_enterprise: github,
  oidc_gitlab: gitlab,
  saml_okta: okta,
} satisfies Record<string, ProviderLogoGlyph>;

export type EnterpriseLogoId = keyof typeof enterpriseLogos;

const lookup: ReadonlyMap<string, ProviderLogoGlyph> = new Map(Object.entries(enterpriseLogos));

export function getEnterpriseLogo(id: string): ProviderLogoGlyph | undefined {
  return lookup.get(id);
}
