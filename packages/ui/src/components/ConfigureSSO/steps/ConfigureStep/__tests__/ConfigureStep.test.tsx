import { describe, expect, it } from 'vitest';

import type { EnterpriseConnectionProviderType } from '../../../types';
import { resolveConfigureSteps } from '../index';
import { OidcCustomConfigureSteps } from '../oidc';
import {
  SamlCustomConfigureSteps,
  SamlGoogleConfigureSteps,
  SamlMicrosoftConfigureSteps,
  SamlOktaConfigureSteps,
} from '../saml';

describe('resolveConfigureSteps', () => {
  it('dispatches OIDC provider keys to the OIDC sub-flow', () => {
    expect(resolveConfigureSteps('oidc_clerk_dev')).toBe(OidcCustomConfigureSteps);
    expect(resolveConfigureSteps('oidc_ghe_acme')).toBe(OidcCustomConfigureSteps);
    expect(resolveConfigureSteps('oidc_gitlab_ent_acme')).toBe(OidcCustomConfigureSteps);
    expect(resolveConfigureSteps('oidc_custom')).toBe(OidcCustomConfigureSteps);
  });

  it('dispatches SAML providers by exact literal', () => {
    expect(resolveConfigureSteps('saml_okta')).toBe(SamlOktaConfigureSteps);
    expect(resolveConfigureSteps('saml_custom')).toBe(SamlCustomConfigureSteps);
    expect(resolveConfigureSteps('saml_google')).toBe(SamlGoogleConfigureSteps);
    expect(resolveConfigureSteps('saml_microsoft')).toBe(SamlMicrosoftConfigureSteps);
  });

  it('returns undefined for an unrecognized provider so the caller can degrade', () => {
    expect(resolveConfigureSteps('ldap_enterprise' as EnterpriseConnectionProviderType)).toBeUndefined();
  });
});
