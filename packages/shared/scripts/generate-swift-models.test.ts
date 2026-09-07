import { describe, expect, it } from 'vitest';

import { generateSwiftModels, SWIFT_METHOD_ROOTS } from './generate-swift-models';

describe('generateSwiftModels', () => {
  const files = generateSwiftModels();
  const byName = new Map(files.map(file => [file.filename, file.contents]));

  it('emits User with id, firstName from first_name, and createdAt: Date', () => {
    const user = byName.get('User.swift');
    expect(user, 'UserJSON must emit User.swift').toBeDefined();
    expect(user, 'User.id is a stable string identifier').toContain('public var id: String');
    expect(user, 'User.firstName comes from first_name').toContain('public var firstName: String?');
    expect(user, 'User.firstName CodingKey is first_name').toContain('case firstName = "first_name"');
    expect(user, 'User.createdAt is Date from created_at milliseconds').toContain('public var createdAt: Date');
    expect(user, 'User.createdAt CodingKey is created_at').toContain('case createdAt = "created_at"');
    expect(
      byName.get('JSONValue.swift'),
      'models decode both snake_case FAPI keys and camelCase clerkDecoder keys',
    ).toContain('struct FAPIJSONKey');
    expect(byName.get('JSONValue.swift'), 'invocation arguments are hashable').toContain(
      'public enum JSONValue: Codable, Equatable, Hashable, Sendable',
    );
  });

  it('emits a string union as an enum with unknown(String)', () => {
    const status = byName.get('SessionStatus.swift');
    expect(status, 'SessionStatus is a string-literal union on SessionJSON').toBeDefined();
    expect(status, 'closed string unions keep their known cases').toContain('case active');
    expect(status, 'string unions include unknown(String) for forward compat').toContain('case unknown(String)');
  });

  it('emits organization satellites and billing resources from explicit JSON roots', () => {
    expect(byName.get('OrganizationDomain.swift'), 'OrganizationDomainJSON emits OrganizationDomain').toBeDefined();
    expect(
      byName.get('OrganizationInvitation.swift'),
      'OrganizationInvitationJSON emits OrganizationInvitation',
    ).toBeDefined();
    expect(
      byName.get('OrganizationMembershipRequest.swift'),
      'OrganizationMembershipRequestJSON emits OrganizationMembershipRequest',
    ).toBeDefined();
    expect(
      byName.get('OrganizationSuggestion.swift'),
      'OrganizationSuggestionJSON emits OrganizationSuggestion',
    ).toBeDefined();
    expect(
      byName.get('UserOrganizationInvitation.swift'),
      'UserOrganizationInvitationJSON emits UserOrganizationInvitation',
    ).toBeDefined();
    expect(byName.get('Role.swift'), 'RoleJSON emits Role').toBeDefined();
    expect(byName.get('Permission.swift'), 'PermissionJSON emits Permission').toBeDefined();
    expect(byName.get('BillingSubscription.swift'), 'BillingSubscriptionJSON emits BillingSubscription').toBeDefined();
    expect(byName.get('BillingPlan.swift'), 'BillingPlanJSON emits BillingPlan').toBeDefined();
    expect(byName.get('Feature.swift'), 'FeatureJSON emits Feature').toBeDefined();
    expect(byName.get('TOTP.swift'), 'TOTPJSON emits TOTP').toBeDefined();
    expect(byName.get('BackupCode.swift'), 'BackupCodeJSON emits BackupCode').toBeDefined();
    expect(byName.get('DeletedObject.swift'), 'DeletedObjectJSON emits DeletedObject').toBeDefined();
    expect(
      byName.get('DeletedObject.swift'),
      'JS delete payloads can omit object; keep the stored field required',
    ).toContain('decodeFlexibleDefault(String.self, snake: "object", camel: "object", default: "deleted_object")');
    expect(byName.get('SignUpData.swift'), 'live FAPI sign_up omits allowlist_only and captcha_enabled').toContain(
      'decodeFlexibleDefault(Bool.self, snake: "allowlist_only", camel: "allowlistOnly", default: false)',
    );
    expect(byName.get('SignUpData.swift'), 'live FAPI sign_up omits captcha_enabled').toContain(
      'decodeFlexibleDefault(Bool.self, snake: "captcha_enabled", camel: "captchaEnabled", default: false)',
    );
    expect(byName.get('APIKeysSettings.swift'), 'live FAPI api_keys_settings omits id and object').toContain(
      'decodeFlexibleDefault(String.self, snake: "id", camel: "id", default: "")',
    );
    expect(byName.get('SignInDataSecondFactor.swift'), 'live FAPI sign_in.second_factor omits enabled').toContain(
      'decodeFlexibleDefault(Bool.self, snake: "enabled", camel: "enabled", default: false)',
    );
    expect(byName.get('JSONValue.swift'), 'required FAPI omissions decode through one helper').toContain(
      'func decodeFlexibleDefault',
    );
    expect(byName.get('Environment.swift'), 'live FAPI environment omits object and nested settings').toContain(
      'decodeFlexibleDefault(UserSettings.self, snake: "user_settings", camel: "userSettings", default: .empty)',
    );
    expect(
      byName.get('ClerkEnvironment.swift'),
      'ClerkEnvironment writes Environment.swift so it does not collide with SwiftUI',
    ).toBeUndefined();
    expect(byName.get('Environment.swift'), 'the type remains ClerkEnvironment').toContain(
      'public struct ClerkEnvironment:',
    );
    expect(
      byName.get('SessionActivity.swift'),
      'SessionActivityJSON is a model root so latest_activity can decode',
    ).toContain('public struct SessionActivity:');
    expect(byName.get('SessionActivity.swift'), 'session_activity payloads can omit object').toContain(
      'decodeFlexibleDefault(String.self, snake: "object", camel: "object", default: "session_activity")',
    );
    const sessionActivity = byName.get('SessionActivity.swift') ?? '';
    expect(
      sessionActivity.indexOf('public var id: String'),
      'id stays first so Kit SessionActivity(id:) call sites keep their labels',
    ).toBeLessThan(sessionActivity.indexOf('public var object: String'));
    expect(
      sessionActivity,
      'synthesized SessionActivity == crashes Client Observation; emit field-by-field ==',
    ).toContain('public static func == (lhs: SessionActivity, rhs: SessionActivity) -> Bool');
    expect(
      byName.get('DisplayConfig.swift'),
      'live FAPI display_config keeps application_name required with a decoder default',
    ).toContain('decodeFlexibleDefault(String.self, snake: "application_name", camel: "applicationName", default: "")');
    expect(byName.get('User.swift'), 'JS user snapshots can omit object and identifier arrays').toContain(
      'decodeFlexibleDefault(String.self, snake: "object", camel: "object", default: "user")',
    );
    expect(byName.get('Client.swift'), 'client sessions default to empty when omitted').toContain(
      'decodeFlexibleDefault([Session].self, snake: "sessions", camel: "sessions", default: [])',
    );
    expect(byName.get('ClerkImage.swift'), 'ImageJSON emits ClerkImage to avoid SwiftUI.Image').toBeDefined();
    expect(byName.get('Image.swift'), 'ImageJSON must not emit Image.swift').toBeUndefined();
    const session = byName.get('Session.swift') ?? '';
    expect(session, 'session snapshots include latest_activity from SessionWithActivitiesJSON').toContain(
      'public var latestActivity: SessionActivity?',
    );
    expect(
      session.indexOf('public var latestActivity'),
      'latestActivity stays before createdAt so Kit convenience inits keep their labels',
    ).toBeLessThan(session.indexOf('public var createdAt'));
    expect(byName.get('Session.swift'), 'JS session snapshots can omit object and required dates').toContain(
      'decodeFlexibleDefault(String.self, snake: "object", camel: "object", default: "session")',
    );
    expect(byName.get('Session.swift'), 'omitted session.user decodes through User.empty').toContain(
      'decodeFlexibleDefault(User.self, snake: "user", camel: "user", default: .empty)',
    );
    expect(byName.get('EmailAddress.swift'), 'FAPI email payloads can omit created_at').toContain(
      'decodeIfPresentMillisecondsDate(snake: "created_at", camel: "createdAt") ?? Date(timeIntervalSince1970: 0)',
    );
    expect(byName.get('SignInStatus.swift'), 'closed string unions are Hashable so identifier types can be').toContain(
      'public enum SignInStatus: Codable, Equatable, Hashable, Sendable',
    );
    expect(
      byName.get('ClerkAPIError.swift'),
      'ClerkAPIError stays a class so Optional<Verification> copy does not crash',
    ).toContain('public final class ClerkAPIError:');
    expect(
      byName.get('ClerkAPIError.swift'),
      'JS errors carry clerkTraceId even when ClerkAPIErrorJSON omits it',
    ).toContain('decodeFlexibleDefault(String.self, snake: "clerk_trace_id", camel: "clerkTraceId", default: "")');
    expect(byName.get('AuthConfig.swift'), 'nativeSettings is required on generated AuthConfig').toContain(
      'public var nativeSettings: NativeSettings',
    );
    expect(byName.get('AuthConfig.swift'), 'session_minter stays required with a decoder default').toContain(
      'public var sessionMinter: Bool',
    );
    expect(
      byName.get('Verification.swift'),
      'trusted_device_challenge is a Kit extra stored as a JSON string',
    ).toContain('public var trustedDeviceChallenge: String');
    expect(byName.get('SignInIdentifier.swift'), 'iOS passkey sign-in is a first-class identifier').toContain(
      'case passkey',
    );
    expect(
      byName.get('OrganizationEnrollmentMode.swift'),
      'org domain UI reads enrollment mode as a raw string',
    ).toContain('public var rawValue: String');
  });

  it('reuses one Swift type per JSON type instead of suffixing copies', () => {
    const client = byName.get('Client.swift');
    expect(client, 'ClientJSON must emit Client.swift').toBeDefined();
    expect(client, 'Client.sessions reuses Session').toContain('public var sessions: [Session]');
    expect(client, 'Client.signIn reuses SignIn').toContain('public var signIn: SignIn?');
    expect(client, 'Client.signUp reuses SignUp').toContain('public var signUp: SignUp?');
    expect(
      files
        .filter(file => !file.filename.startsWith('methods/') && /2\.swift$/.test(file.filename))
        .map(file => file.filename),
      'the same TypeScript type must not emit Name2.swift copies',
    ).toEqual([]);
  });

  it('emits headless method façades for the explicit method roots', () => {
    expect(SWIFT_METHOD_ROOTS, 'method roots grow like SWIFT_MODEL_ROOTS').toEqual([
      'HeadlessBrowserClerk',
      'SignInResource',
      'SignUpResource',
      'UserResource',
      'SessionResource',
      'SessionWithActivitiesResource',
      'EmailAddressResource',
      'PhoneNumberResource',
      'PasskeyResource',
      'ExternalAccountResource',
      'OrganizationResource',
      'OrganizationDomainResource',
      'OrganizationInvitationResource',
      'OrganizationMembershipResource',
      'OrganizationMembershipRequestResource',
      'OrganizationSuggestionResource',
      'UserOrganizationInvitationResource',
      'BillingNamespace',
    ]);

    const clerk = byName.get('methods/ClerkJSMethod.swift');
    const signIn = byName.get('methods/SignInJSMethod.swift');
    expect(clerk, 'HeadlessBrowserClerk emits ClerkJSMethod').toBeDefined();
    expect(signIn, 'SignInResource emits SignInJSMethod').toBeDefined();
    expect(clerk, 'generated files keep the do-not-edit header').toContain(
      'Generated by packages/shared/scripts/generate-swift-models.ts. Do not edit.',
    );
    expect(clerk).not.toContain('public protocol');
    expect(byName.get('methods/SignInJSCall.swift')).toContain('case create(SignInCreateParams)');
    expect(clerk, 'JS method names are listed for structured invocations').toContain('case setActive = "setActive"');
    expect(signIn, 'JS method names are listed for structured invocations').toContain('case create = "create"');
    expect(byName.get('methods/SignInCreateParams.swift'), 'create args encode JS names').toContain(
      'public var identifier: String?',
    );
    expect(byName.get('methods/SignInCreateParams.swift'), 'create args keep JS keys, not FAPI snake_case').toContain(
      'case identifier',
    );
    expect(
      byName.get('methods/SignInCreateParams.swift'),
      'optional create args default to nil so calls can supply one field',
    ).toContain('identifier: String? = nil');
    expect(byName.get('methods/SignInCreateParams.swift'), 'optional create args omit nulls for JS').toContain(
      'encodeIfPresent(identifier',
    );

    const emailAddress = byName.get('methods/EmailAddressJSMethod.swift');
    expect(emailAddress, 'EmailAddressResource emits EmailAddressJSMethod').toBeDefined();
    expect(emailAddress, 'EmailAddress.prepareVerification matches the JS name').toContain(
      'case prepareVerification =',
    );
    expect(emailAddress, 'EmailAddress.attemptVerification matches the JS name').toContain(
      'case attemptVerification =',
    );
    expect(emailAddress, 'EmailAddress.destroy matches the JS name').toContain('case destroy =');

    const methodCounts = Object.fromEntries(
      ['Clerk', 'SignIn', 'SignUp', 'User', 'Session', 'EmailAddress'].map(owner => {
        const contents = byName.get(`methods/${owner}JSMethod.swift`) ?? '';
        return [owner, [...contents.matchAll(/^  case /gm)].length];
      }),
    );
    expect(methodCounts, 'headless method counts per root').toEqual({
      Clerk: 8,
      SignIn: 9,
      SignUp: 11,
      User: 25,
      Session: 11,
      EmailAddress: 5,
    });
  });

  it('emits JSCall enums that bind method names to params', () => {
    const user = byName.get('methods/UserJSCall.swift');
    expect(user, 'UserResource emits UserJSCall').toBeDefined();
    expect(user, 'update takes the generated params struct unlabeled').toContain('case update(UpdateUserParams)');
    expect(user, 'primitive arguments stay labelled').toContain('case leaveOrganization(organizationId: String)');
    expect(user, 'no-arg methods have no associated value').toMatch(/case createTOTP$/m);
    expect(user, 'optional params stay optional so nil omits the JS argument').toContain(
      'case reload(ClerkResourceReloadParams?)',
    );
    expect(user, 'jsMethod uses the generated raw name').toContain('UserJSMethod.update.rawValue');
    expect(user, 'nil optional params encode as no argument').toContain(
      'if let p { args.append(try JSONValue(encoding: p)) }',
    );

    const session = byName.get('methods/SessionJSCall.swift');
    expect(session, 'SessionResource emits SessionJSCall').toBeDefined();
    expect(session, 'getToken keeps its options struct').toContain('case getToken(GetTokenOptions?)');

    const listed = byName.get('methods/SessionWithActivitiesJSCall.swift');
    expect(listed, 'SessionWithActivitiesResource is a method root').toBeDefined();
    expect(listed, 'revoke is the listed-session method').toContain('case revoke');
    expect(listed, 'revoke has no params').toMatch(/case revoke$/m);
  });

  it('emits one honest ClerkPaginatedResponse whose data is [JSONValue]', () => {
    const page = byName.get('methods/ClerkPaginatedResponse.swift');
    expect(page, 'paginated returns share one generated struct').toBeDefined();
    expect(page, 'heterogeneous pages must not claim OrganizationMembership').toContain('public var data: [JSONValue]');
    expect(page, 'paginated data is never a first-wins model').not.toContain('OrganizationMembership');
  });

  it('does not collapse Passkey.update onto SignUpCreateParams', () => {
    const passkey = byName.get('methods/PasskeyJSCall.swift');
    expect(passkey, 'PasskeyResource emits PasskeyJSCall').toBeDefined();
    expect(passkey, 'Partial<Passkey> must not intern as the first Partial').not.toContain('SignUpCreateParams');
    expect(passkey, 'Passkey.update keeps a passkey-shaped params type').toMatch(/case update\(\w+\)/);
  });

  it('skips mount, open, redirect, appearance, ClerkUI, Web3, and DOM methods', () => {
    const methodFiles = files.filter(file => file.filename.startsWith('methods/')).map(file => file.contents);
    const all = methodFiles.join('\n');
    const methods = files
      .filter(file => file.filename.endsWith('JSMethod.swift'))
      .map(file => file.contents)
      .join('\n');
    expect(methods, 'mount* is UI').not.toContain('case mount');
    expect(methods, 'open* is UI').not.toContain('case open');
    expect(methods, 'redirect* is browser navigation').not.toContain('case redirect');
    expect(methods, 'Web3 wallet methods are skipped').not.toContain('case authenticateWithMetamask');
    expect(methods, 'Web3 wallet methods are skipped').not.toContain('case authenticateWithWeb3');
    expect(methods, 'popup methods are browser chrome').not.toContain('case authenticateWithPopup');
    expect(all, 'HTMLDivElement methods are skipped').not.toContain('HTMLDivElement');
    expect(all, 'appearance stays out of method façades').not.toMatch(/\bappearance\b/);
    expect(all, 'ClerkUI stays out of method façades').not.toContain('ClerkUI');
  });
});
