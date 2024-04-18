import createLoader from '../../util/load-change.js';

const load = createLoader({
  version: 'core-2',
  baseUrl: 'https://clerk.com/docs/upgrade-guides/core-2',
});

const changesAffectingAll = [
  'organization-getroles-arguments-changed',
  'organization-getmemberships-arguments-changed',
  'organization-getdomains-arguments-change',
  'organization-getinvitations-arguments-changed',
  'organization-getmembershiprequests-arguments-changed',
  'user-getorganizationinvitations-arguments-changed',
  'user-getorganizationsuggestions-arguments-changed',
  'user-getorganizationmemberships-arguments-changed',
  'user-getorganizationmemberships-return-signature',
  'getorganizationinvitationlist-return-signature',
  'getorganizationinvitationlist-return-type-change',
  'getorganizationmembershiplist-return-type-change',
  'getorganizationlist-return-signature',
  'getorganizationlist-return-type-change',
  'getinvitationlist-return-signature',
  'getsessionlist-return-signature',
  'getuserlist-return-signature',
  'getallowlistidentifierlist-return-signature',
  'getclientlist-return-signature',
  'getredirecturllist-return-signature',
  'getuseroauthaccesstoken-return-signature',
  'organization-logourl',
  'user-profileimageurl',
  'user-update-password',
];

const jsChanges = [
  'setsession',
  'organization-create-string',
  'organization-getpendinginvitations',
  'mfa-dropdown',
  'appearance-variables-breaking-changes',
  'aftersignxurl-changes',
];

const reactChanges = [
  'magiclinkerrorcode',
  'usemagiclink',
  'ismagiclinkerror',
  'magiclinkerror',
  'handlemagiclinkverification',
  'clerkprovider-frontendapi-2',
  'navigate-to-routerpush-routerreplace',
  'afterswitchorganizationurl',
  'appearance-organizationpreview-organizationswitcher',
  'useorganization-invitationlist',
  'useorganization-membershiplist',
  'useorganizations',
  'userprofile-prop',
  'organizationprofile-settings',
  'userprofile-security',
  'connected-accounts-dropdown',
  'userbuttonpopoveractionbuttontext-removed',
  'userbuttontrigger-userbuttonbox-invert',
  'organizationswitcherpopoveractionbuttontext-removed',
  'card-changes',
  'alternativemethods-backlink',
  'button-to-organizationlistcreateorganizationactionbutton',
  'remove-socialbuttonsblockbuttonarrow',
  'remove-identitypreview-avatar',
  'withsession-removed',
  'withclerk-removed',
  'withuser-removed-2',
  'withclerk-hof-removed',
  'withsession-hof-removed',
  'withuser-hof-removed',
  'multisessionappsupport-import-change',
  'clerkprovideroptionswrapper-dropped',
  'new-localization-keys',
  'removed-localization-keys',
  'changed-localization-keys',
  'signoutcallback-to-redirecturl',
  'min-react-version',
  'externalaccount-avatarurl',
  'organizationmembershippublicuserdata-profileimageurl',
];

export default {
  nextjs: load(
    'nextjs',
    dedupeMerge(changesAffectingAll, jsChanges, [
      'api-key-to-secret-key',
      'frontend-api-to-publishable-key',
      'with-clerk-middleware-removed',
      'auth-middleware-deprecated',
      'clerk-js-version-next-public',
      'authmiddleware-apikey',
      'authmiddleware-frontendapi',
      'createclerkclient-apikey',
      'createclerkclient-frontendapi',
      'getauth-apikey',
      'clerkprovider-frontendapi-2',
      'import-nextjs-app-beta',
      'import-nextjs-ssr',
      'import-nextjs-edge-middleware',
      'import-nextjs-edge-middlewarefiles',
      'import-api-url',
      'import-api-version',
      'import-clerk-js-url',
      'import-clerk-js-version',
      'import-domain',
      'import-is-satellite',
      'import-proxy-url',
      'import-publishable-key',
      'import-secret-key',
      'import-sign-in-url',
      'import-sign-up-url',
      'import-nextjs-api',
      'api-url-value-change',
      'ismagiclinkerror',
      'usemagiclink',
      'magiclinkerrorcode',
      'organizationprofile-settings',
      'userprofile-security',
      'connected-accounts-dropdown',
      'userbuttonpopoveractionbuttontext-removed',
      'userbuttontrigger-userbuttonbox-invert',
      'organizationswitcherpopoveractionbuttontext-removed',
      'card-changes',
      'alternativemethods-backlink',
      'button-to-organizationlistcreateorganizationactionbutton',
      'remove-socialbuttonsblockbuttonarrow',
      'remove-identitypreview-avatar',
      'multisessionappsupport-import-change',
      'auth-import-change',
      'currentuser-import-change',
      'authmiddleware-import-change',
      'buildclerkprops-import-change',
      'verifytoken-import-change',
      'verifyjwt-import-change',
      'decodejwt-import-change',
      'signjwt-import-change',
      'constants-import-change',
      'createauthenticaterequest-import-change',
      'createisomorphicrequest-import-change',
      'clerk-import-change',
      'isclerkapiresponserror-import-change',
      'isemaillinkerror-import-change',
      'isknownerror-import-change',
      'ismetamaskerror-import-change',
      'withsession-removed',
      'withclerk-removed',
      'withuser-removed-2',
      'withclerk-hof-removed',
      'withsession-hof-removed',
      'withuser-hof-removed',
      'next-public-clerk-js-url',
      'new-localization-keys',
      'removed-localization-keys',
      'changed-localization-keys',
      'signoutcallback-to-redirecturl',
      'min-nextjs-version',
      'redirecttosignin-import-path',
      'redirecttosignup-import-path',
      'externalaccount-avatarurl',
      'organizationmembershippublicuserdata-profileimageurl',
    ]),
  ),
  // since we export clerk-react at the top level from the gatsby plugin
  // if you're using gatsby, we also need to scan for the react changes
  gatsby: load(
    'gatsby',
    dedupeMerge(changesAffectingAll, reactChanges, jsChanges, [
      'api-key-to-secret-key',
      'createclerkclient-apikey',
      'apikey-to-publishable-key',
      'createclerkclient-frontendapi',
      'ismagiclinkerror',
      'usemagiclink',
      'magiclinkerrorcode',
      'api-url-value-change',
      'withserverauth-return-type',
      'clerk-import-change',
    ]),
  ),
  remix: load(
    'remix',
    dedupeMerge(changesAffectingAll, jsChanges, [
      'clerkerrorboundary-removed',
      'createclerkclient-apikey',
      'rootauthloader-apikey',
      'getauth-apikey',
      'clerkprovider-frontendapi-2',
      'rootauthloader-frontendapi',
      'frontend-api-to-publishable-key',
      'api-key-to-secret-key',
      'ismagiclinkerror',
      'magiclinkerrorcode',
      'usemagiclink',
      'new-localization-keys',
      'removed-localization-keys',
      'changed-localization-keys',
      'signoutcallback-to-redirecturl',
      'clerk-import-change',
      'externalaccount-avatarurl',
      'organizationmembershippublicuserdata-profileimageurl',
    ]),
  ),
  expo: load(
    'expo',
    dedupeMerge(changesAffectingAll, jsChanges, [
      'apikey-to-publishable-key',
      'ismagiclinkerror',
      'usemagiclink',
      'magiclinkerrorcode',
      'organizationprofile-settings',
      'userprofile-security',
      'connected-accounts-dropdown',
      'userbuttonpopoveractionbuttontext-removed',
      'userbuttontrigger-userbuttonbox-invert',
      'organizationswitcherpopoveractionbuttontext-removed',
      'card-changes',
      'alternativemethods-backlink',
      'button-to-organizationlistcreateorganizationactionbutton',
      'remove-socialbuttonsblockbuttonarrow',
      'remove-identitypreview-avatar',
      'new-localization-keys',
      'removed-localization-keys',
      'changed-localization-keys',
      'signoutcallback-to-redirecturl',
      'externalaccount-avatarurl',
      'organizationmembershippublicuserdata-profileimageurl',
    ]),
  ),
  fastify: load(
    'fastify',
    dedupeMerge(changesAffectingAll, [
      'api-key-to-secret-key',
      'api-url-value-change',
      'frontend-api-to-publishable-key',
      'createclerkclient-apikey',
      'createclerkclient-frontendapi',
      'clerkplugin-frontendapi',
      'clerk-import-change',
      'externalaccount-avatarurl',
      'organizationmembershippublicuserdata-profileimageurl',
    ]),
  ),
  node: load(
    'node',
    dedupeMerge(changesAffectingAll, [
      'api-key-to-secret-key',
      'api-url-value-change',
      'frontend-api-to-publishable-key',
      'clerkexpressrequireauth-apikey',
      'clerkexpresswithauth-apikey',
      'createclerkclient-apikey',
      'createclerkexpressrequireauth-apikey',
      'createclerkexpresswithauth-apikey',
      'createclerkclient-frontendapi',
      'createclerkexpressrequireauth-frontendapi',
      'clerkexpressrequireauth-frontendapi',
      'createclerkexpresswithauth-frontendapi',
      'clerkexpresswithauth-frontendapi',
      'setclerkapikey',
      'setclerkapiversion',
      'setclerkhttpoptions',
      'setclerkserverapiurl',
      'cjs-esm-instance',
      'legacyauthobject-removed',
      'clerk-import-change',
      'organizationmembershippublicuserdata-profileimageurl',
      'externalaccount-picture',
    ]),
  ),
  react: load('react', dedupeMerge(changesAffectingAll, reactChanges, jsChanges)),
  js: load(
    'js',
    dedupeMerge(changesAffectingAll, jsChanges, [
      'magiclinkerror',
      'ismagiclinkerror',
      'magiclinkerrorcode',
      'usemagiclink',
      'handlemagiclinkverification',
      'user-orgpublicdata-profileimageurl',
      'experimental-canusecaptcha',
      'experimental-captchaurl',
      'experimental-captchasitekey',
      'getorganizationmemberships',
      'lastorganizationinvitation-member',
      'unstable-invitationupdate',
      'unstable-membershipupdate',
      'user-createexternalaccount-redirecturl', // maybe shared with all?
      'signup-attemptweb3walletverification-generatedsignature',
      'redirecttohome',
      'organizationprofile-settings',
      'userprofile-security',
      'connected-accounts-dropdown',
      'userbuttonpopoveractionbuttontext-removed',
      'userbuttontrigger-userbuttonbox-invert',
      'organizationswitcherpopoveractionbuttontext-removed',
      'card-changes',
      'alternativemethods-backlink',
      'button-to-organizationlistcreateorganizationactionbutton',
      'remove-socialbuttonsblockbuttonarrow',
      'remove-identitypreview-avatar',
      'clerk-isready-removed',
      'new-localization-keys',
      'removed-localization-keys',
      'changed-localization-keys',
      'signoutcallback-to-redirecturl',
      'externalaccount-avatarurl',
      'organizationmembershippublicuserdata-profileimageurl',
    ]),
  ),
  shared: load('shared', [
    'magiclinkerror',
    'ismagiclinkerror',
    'magiclinkerrorcode',
    'usemagiclink',
    'getrequesturl',
    'organizationcontext',
    'useorganizationlist-organizationlist', // shared outside this pkg?
  ]),
  'chrome-extension': load(
    'chrome-extension',
    dedupeMerge(changesAffectingAll, jsChanges, ['clerkprovider-tokencache']),
  ),
  localizations: load('localization', [
    'new-localization-keys',
    'removed-localization-keys',
    'changed-localization-keys',
  ]),
  backend: load(
    'backend',
    dedupeMerge(changesAffectingAll, [
      'api-url-value-changed',
      'verifyjwt-import-path-move',
      'decodejwt-import-path-move',
      'signjwt-import-path-move',
      'constants-import-path-move',
      'redirect-import-path-move',
      'createauthenticaterequest-import-path-move',
      'createisomorphicrequest-import-path-move',
      'createclerkclient-frontendapi',
      'authenticaterequest-params-change',
      'clerk-import',
      'externalaccount-picture',
      'externalaccountjson-avatarurl',
      'organizationjson-logourl',
      'userjson-profileimageurl',
      'organizationmembershippublicuserdata-profileimageurl',
      'organizationmembershippublicuserdatajson-profileimageurl',
      'clockskewinseconds',
      'pkgversion',
      'client-unstableoptions-removed',
      'httpoptions-removed',
      'createisomorphicrequest-removed',
      'createemail-removed',
      'signjwterror-import-move',
      'tokenverificationerror-import-move',
      'tokenverificationerroraction-import-move',
      'tokenverificationerrorreason-import-move',
      'membershiprole',
      'getorganizationmembershiplist-return-signature',
      'buildrequesturl-removed',
      'createclerkclient-apikey',
      'getclientlist-arguments',
      'getsessionlist-arguments',
    ]),
  ),
  types: [],
  redwood: [],
  express: [],
};

function dedupeMerge(...arrays) {
  return [...new Set(arrays.flat())];
}
