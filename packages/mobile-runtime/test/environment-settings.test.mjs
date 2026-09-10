import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

async function environmentFixture(t, section, value) {
  const environment = structuredClone(fixtures.environment);
  if (value === undefined) delete environment[section];
  else environment[section] = value;
  const f = await fixture({
    http: request => {
      if (new URL(request.url).pathname.endsWith('/environment')) {
        assert.equal(request.method, 'GET');
        return response(environment);
      }
    },
  });
  t.after(f.dispose);
  const get = () => f.resource(f.resource(f.state.roots.clerk).environment.$ref);
  return { f, get };
}

for (const [name, value] of [
  ['missing', undefined],
  ['empty', {}],
  ['null children', { domains: null, actions: null, slug: null, organization_creation_defaults: null }],
  ['partial', { enabled: true, max_allowed_memberships: 5 }],
  [
    'partial nested settings',
    { enabled: true, domains: {}, actions: {}, slug: {}, organization_creation_defaults: {} },
  ],
  [
    'complete',
    {
      enabled: true,
      max_allowed_memberships: 10,
      force_organization_selection: true,
      actions: { admin_delete: true },
      domains: { enabled: true, enrollment_modes: ['automatic_invitation'], default_role: 'org:member' },
      slug: { disabled: true },
      organization_creation_defaults: { enabled: true },
    },
  ],
]) {
  test(`environment accepts ${name} organization settings with canonical defaults`, async t => {
    const { get } = await environmentFixture(t, 'organization_settings', value);
    assert.deepEqual(get().organizationSettings, {
      enabled: value?.enabled ?? false,
      maxAllowedMemberships: value?.max_allowed_memberships ?? 1,
      forceOrganizationSelection: value?.force_organization_selection ?? false,
      actions: { adminDelete: value?.actions?.admin_delete ?? false },
      domains: {
        enabled: value?.domains?.enabled ?? false,
        enrollmentModes: value?.domains?.enrollment_modes ?? [],
        defaultRole: value?.domains?.default_role ?? null,
      },
      slug: { disabled: value?.slug?.disabled ?? false },
      organizationCreationDefaults: { enabled: value?.organization_creation_defaults?.enabled ?? false },
    });
  });
}

for (const supportEmail of [undefined, null, 'help@example.com']) {
  test(`display support email preserves ${supportEmail === undefined ? 'missing' : supportEmail}`, async t => {
    const display = structuredClone(fixtures.environment.display_config);
    if (supportEmail === undefined) delete display.support_email;
    else display.support_email = supportEmail;
    const { get } = await environmentFixture(t, 'display_config', display);
    assert.equal(get().displayConfig.supportEmail, supportEmail ?? '');
  });
}

for (const immutable of [undefined, false, true]) {
  test(`user attribute preserves ${immutable ?? 'missing'} immutable and factor settings`, async t => {
    const settings = structuredClone(fixtures.environment.user_settings);
    const attribute = {
      enabled: true,
      required: true,
      used_for_first_factor: true,
      first_factors: ['email_code'],
      used_for_second_factor: false,
      second_factors: [],
      verifications: ['email_code'],
      verify_at_sign_up: true,
    };
    if (immutable !== undefined) attribute.immutable = immutable;
    settings.attributes.email_address = attribute;
    const { get } = await environmentFixture(t, 'user_settings', settings);
    assert.deepEqual(get().userSettings.attributes.email_address, { ...attribute, name: 'email_address' });
  });
}

for (const [name, enabled, firstFactor] of [
  ['first factor', true, true],
  ['registration only', true, false],
  ['disabled', false, true],
]) {
  test(`passkey attributes preserve ${name} configuration`, async t => {
    const settings = structuredClone(fixtures.environment.user_settings);
    Object.assign(settings.attributes.passkey, { enabled, used_for_first_factor: firstFactor });
    const { get } = await environmentFixture(t, 'user_settings', settings);
    const actual = get().userSettings.attributes.passkey;
    assert.equal(actual.enabled, enabled);
    assert.equal(actual.used_for_first_factor, firstFactor);
  });
}

test('missing required passkey attribute fails the generated contract', async t => {
  const environment = structuredClone(fixtures.environment);
  delete environment.user_settings.attributes.passkey;
  const f = await fixture({
    allowFailure: true,
    http: request => {
      if (new URL(request.url).pathname.endsWith('/environment')) return response(environment);
    },
  });
  t.after(f.dispose);
  assert.equal(f.ready.kind, 'initializationFailed');
  assert.equal(f.ready.failure.code, 'invalid_projection:EnvironmentResource.userSettings');
});

for (const warning of [undefined, false, true]) {
  test(`development warning preserves ${warning ?? 'missing/default false'}`, async t => {
    const display = structuredClone(fixtures.environment.display_config);
    if (warning === undefined) delete display.show_devmode_warning;
    else display.show_devmode_warning = warning;
    const { get } = await environmentFixture(t, 'display_config', display);
    assert.equal(get().displayConfig.showDevModeWarning, warning ?? false);
  });
}

for (const [name, auth] of [
  ['missing', undefined],
  ['single session only', { single_session_mode: true }],
  [
    'all native flags',
    {
      single_session_mode: false,
      session_minter: true,
      native_settings: {
        api_enabled: true,
        trusted_device_sign_in_enabled: true,
        trusted_device_enrollment_prompt_after_sign_in_enabled: true,
        trusted_device_enrollment_prompt_after_sign_up_enabled: true,
      },
    },
  ],
]) {
  test(`auth configuration preserves ${name}`, async t => {
    const { get } = await environmentFixture(t, 'auth_config', auth);
    const actual = get().authConfig;
    assert.equal(actual.singleSessionMode, auth?.single_session_mode ?? false);
    assert.equal(actual.sessionMinter, auth?.session_minter ?? false);
    assert.deepEqual(actual.nativeSettings, {
      apiEnabled: auth?.native_settings?.api_enabled ?? false,
      trustedDeviceSignInEnabled: auth?.native_settings?.trusted_device_sign_in_enabled ?? false,
      trustedDeviceEnrollmentPromptAfterSignInEnabled:
        auth?.native_settings?.trusted_device_enrollment_prompt_after_sign_in_enabled ?? false,
      trustedDeviceEnrollmentPromptAfterSignUpEnabled:
        auth?.native_settings?.trusted_device_enrollment_prompt_after_sign_up_enabled ?? false,
    });
  });
}

for (const [name, billing] of [
  ['missing', undefined],
  [
    'user',
    {
      stripe_publishable_key: 'pk_test_123',
      user: { enabled: true, has_paid_plans: true },
      organization: { enabled: false, has_paid_plans: false },
    },
  ],
  [
    'organization',
    {
      stripe_publishable_key: 'pk_live_abc',
      user: { enabled: false, has_paid_plans: false },
      organization: { enabled: true, has_paid_plans: true },
    },
  ],
  [
    'null publishable key',
    {
      stripe_publishable_key: null,
      user: { enabled: true, has_paid_plans: false },
      organization: { enabled: false, has_paid_plans: false },
    },
  ],
  [
    'future field',
    {
      stripe_publishable_key: 'pk_test_future',
      user: { enabled: true, has_paid_plans: false },
      organization: { enabled: true, has_paid_plans: false },
      future_flag: true,
    },
  ],
]) {
  test(`commerce configuration preserves ${name}`, async t => {
    const { get } = await environmentFixture(t, 'commerce_settings', billing && { billing });
    assert.deepEqual(get().commerceSettings.billing, {
      stripePublishableKey: billing?.stripe_publishable_key ?? null,
      user: { enabled: billing?.user.enabled ?? false, hasPaidPlans: billing?.user.has_paid_plans ?? false },
      organization: {
        enabled: billing?.organization.enabled ?? false,
        hasPaidPlans: billing?.organization.has_paid_plans ?? false,
      },
    });
  });
}
