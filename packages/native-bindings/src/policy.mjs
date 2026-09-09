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
    'PhoneNumberResource.backupCodes': 'Recovery secrets are not included in general resource observation.',
    'EnterpriseConnectionTestRunOauthPayloadResource.idToken':
      'Provider credentials are not included in general resource observation.',
    'EnterpriseConnectionTestRunOauthPayloadResource.accessToken':
      'Provider credentials are not included in general resource observation.',
    'SessionResource.lastActiveToken': 'Session JWTs are only returned by getToken, never broadcast as state.',
  },
  adapted: {
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
  return name.replaceAll('Future', '').replace(/Resource$/, '');
}
