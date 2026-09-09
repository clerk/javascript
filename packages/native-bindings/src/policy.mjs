export const profile = {
  version: 1,
  jsonObjects: [
    'SignUpUnsafeMetadata',
    'UserPublicMetadata',
    'UserUnsafeMetadata',
    'OrganizationPublicMetadata',
    'OrganizationInvitationPublicMetadata',
    'OrganizationMembershipPublicMetadata',
    'UserOrganizationInvitationPublicMetadata',
    'ActClaim',
    'AgentActClaim',
  ],
  jsonMembers: {
    'ExternalAccountResource.publicMetadata': 'User-defined JSON metadata.',
    'EnterpriseAccountResource.publicMetadata': 'User-defined JSON metadata.',
    'EnterpriseConnectionResource.customAttributes': 'User-defined JSON attributes.',
    'OrganizationEnterpriseConnectionSamlInput.attributeMapping': 'User-defined SAML attribute mapping.',
    'UpdateOrganizationEnterpriseConnectionParams.customAttributes': 'User-defined JSON attributes.',
  },
  roots: {
    clerk: ['mobile.ts', 'MobileClerk'],
    signIn: ['signInFuture.ts', 'SignInFutureResource'],
    signUp: ['signUpFuture.ts', 'SignUpFutureResource'],
    session: ['session.ts', 'SessionResource'],
    user: ['user.ts', 'UserResource'],
    organization: ['organization.ts', 'OrganizationResource'],
  },
  excluded: {
    'TOTPResource.reload': 'Enrollment secrets are explicit method return values, not shared observable resources.',
    'BackupCodeResource.reload': 'Recovery codes are explicit method return values, not shared observable resources.',
    'DisplayConfigResource.reload': 'Instance configuration is refreshed by the owning core lifecycle.',
    'AuthConfigResource.reload': 'Instance configuration is refreshed by the owning core lifecycle.',
    'OrganizationSettingsResource.reload': 'Instance configuration is refreshed by the owning core lifecycle.',
    'SignInFutureSSOParams.redirectUrl':
      'Native SSO uses the configured browser callback and has no navigation destination.',
    'SignInFutureSSOParams.redirectCallbackUrl': 'Native SSO uses the configured browser callback.',
    'SignUpFutureSSOParams.redirectUrl':
      'Native SSO uses the configured browser callback and has no navigation destination.',
    'SignUpFutureSSOParams.redirectCallbackUrl': 'Native SSO uses the configured browser callback.',
    'PublicKeyCredential.toJSON': 'The bridge serializes credential data; DOM serialization methods do not cross it.',
    'SignInFutureResource.web3': 'Requires a wallet provider runtime; unavailable in the embedded profile.',
    'SignUpFutureResource.web3': 'Requires a wallet provider runtime; unavailable in the embedded profile.',
    'VerificationResource.nonce': 'Protocol secret; not part of general observable state.',
    'VerificationResource.message': 'May contain a signing challenge; only available to a scoped capability.',
    'VerificationResource.externalVerificationRedirectURL':
      'Authentication redirect is delivered only to the browser host.',
    'ProtectCheckResource.token': 'Anti-abuse challenge token is available only to a scoped capability.',
    'PasskeyVerificationResource.publicKey': 'Passkey challenge is delivered only to the credential host.',
    'EnterpriseConnectionTestRunOauthPayloadResource.idToken':
      'Provider credentials are not included in general resource observation.',
    'EnterpriseConnectionTestRunOauthPayloadResource.accessToken':
      'Provider credentials are not included in general resource observation.',
    'SessionResource.lastActiveToken': 'Session JWTs are only returned by getToken, never broadcast as state.',
  },
  explicitReads: {
    'PhoneNumberResource.backupCodes': 'Return recovery codes only to an explicit reader, never in observable state.',
  },
  adapted: {
    'MobileClerk.environment': 'Read instance settings from the existing initialized core.',
    'MobileUserSettings.social': 'Configured providers form a partial map; retain each declared provider shape.',
    'EmailAddressResource.toString': 'Generate stringValue to avoid an asynchronous Kotlin Any.toString override.',
    'PhoneNumberResource.toString': 'Generate stringValue to avoid an asynchronous Kotlin Any.toString override.',
    'Web3WalletResource.toString': 'Generate stringValue to avoid an asynchronous Kotlin Any.toString override.',
    'MobileClerk.session': 'Expose the canonical SessionResource; normalize unloaded undefined to null.',
    'MobileClerk.user': 'Normalize unloaded undefined to null.',
    'MobileClerk.organization': 'Normalize unloaded undefined to null.',
    'MobileClerk.signIn': 'Acquire the actual future facade through a typed accessor.',
    'MobileClerk.signUp': 'Acquire the actual future facade through a typed accessor.',
    'MobileClerk.signOut': 'Navigation-free sign-out; retain core session and credential semantics.',
    'MobileClerk.setActive': 'Navigation-free selection; retain pending session tasks.',
    'SignInFutureResource.finalize': 'Navigation-free session adoption; omit the browser navigate callback.',
    'SignUpFutureResource.finalize': 'Navigation-free session adoption; omit the browser navigate callback.',
    'SignInFutureSSOParams.popup': 'Native browser host owns presentation.',
    'SignUpFutureSSOParams.popup': 'Native browser host owns presentation.',
  },
};

export function nativeName(name) {
  if (name === 'MobileClerk') return 'Clerk';
  if (name === 'MobileEnvironment') return 'EnvironmentResource';
  if (name === 'MobileUserSettings') return 'UserSettings';
  if (name === 'ImageResource') return name;
  if (name === 'Color') return 'DisplayThemeColor';
  return name.replaceAll('Future', '').replace(/Resource$/, '');
}
