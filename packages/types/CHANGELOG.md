# Change Log

## 3.65.5

### Patch Changes

- Remove hCaptcha implementation ([#5317](https://github.com/clerk/javascript/pull/5317)) by [@anagstef](https://github.com/anagstef)

## 3.65.4

### Patch Changes

- Bypass captcha for providers dynamically provided in environment ([#4330](https://github.com/clerk/javascript/pull/4330)) by [@anagstef](https://github.com/anagstef)

## 3.65.3

### Patch Changes

- Allow users to display the email address field after selecting to input a phone number. Previously that was not possible when passkeys were enabled. (v4) ([#3920](https://github.com/clerk/javascript/pull/3920)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

## 3.65.2

### Patch Changes

- Add support for Enstall OAuth provider ([#3467](https://github.com/clerk/javascript/pull/3467)) by [@Nikpolik](https://github.com/Nikpolik)

## 3.65.1

### Patch Changes

- Add experimental support for hCaptcha captcha provider ([#3451](https://github.com/clerk/javascript/pull/3451)) by [@anagstef](https://github.com/anagstef)

## 3.65.0

### Minor Changes

- Added the following types ([#3409](https://github.com/clerk/javascript/pull/3409)) by [@panteliselef](https://github.com/panteliselef)

  ```tsx
  interface Clerk {
    ...
    openGoogleOneTap: (props?: GoogleOneTapProps) => void;
    closeGoogleOneTap: () => void;
    authenticateWithGoogleOneTap: (params: AuthenticateWithGoogleOneTapParams) => Promise<SignInResource | SignUpResource>;
    handleGoogleOneTapCallback: (
      signInOrUp: SignInResource | SignUpResource,
      params: HandleOAuthCallbackParams,
      customNavigate?: (to: string) => Promise<unknown>,
    ) => Promise<unknown>;
    ...
  }

  type GoogleOneTapStrategy = 'google_one_tap'
  ```

## 3.64.1

### Patch Changes

- Use default value for `signIn.userData`, to correctly align it with the types. ([#3284](https://github.com/clerk/javascript/pull/3284)) by [@desiprisg](https://github.com/desiprisg)

## 3.64.0

### Minor Changes

- Add support for different Bot Protection widget types ([#3216](https://github.com/clerk/javascript/pull/3216)) by [@anagstef](https://github.com/anagstef)

- Introduce experimental support for Google One Tap ([#3196](https://github.com/clerk/javascript/pull/3196)) by [@panteliselef](https://github.com/panteliselef)

  - React Component `<__experimental_GoogleOneTap/>`
  - JS `clerk.__experimental_mountGoogleOneTap(node,props)`

### Patch Changes

- Adds translation keys to be able to customize error messages when an identifier already exists: ([#3208](https://github.com/clerk/javascript/pull/3208)) by [@octoper](https://github.com/octoper)

  - form_identifier_exists\_\_email_address
  - form_identifier_exists\_\_username
  - form_identifier_exists\_\_phone_number

## 3.63.1

### Patch Changes

- Add maintenance mode banner to the SignIn and SignUp components. The text can be customized by updating the `maintenanceMode` localization key. by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 3.63.0

### Minor Changes

- Support for prompting a user to reset their password if it is found to be compromised during sign-in. ([#3075](https://github.com/clerk/javascript/pull/3075)) by [@yourtallness](https://github.com/yourtallness)

### Patch Changes

- Update token refresh mechanism to handle network failures without raising an error ([#3068](https://github.com/clerk/javascript/pull/3068)) by [@dimkl](https://github.com/dimkl)

## 3.62.1

### Patch Changes

- Append the devBrowser JWT to searchParams always in order to make v4 support both older v4 versions as well as v5 versions when a redirect flow is goes through AccountPortal ([#2857](https://github.com/clerk/javascript/pull/2857)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 3.62.0

### Minor Changes

- Accept `skipInvitationScreen` as a prop from OrganizationSwitcher. ([#2740](https://github.com/clerk/javascript/pull/2740)) by [@panteliselef](https://github.com/panteliselef)

  `skipInvitationScreen` hides the screen for sending invitations after an organization is created.
  By default, Clerk will automatically hide the screen if the number of max allowed members is equal to 1

## 3.61.0

### Minor Changes

- Add support for X/Twitter v2 OAuth provider ([#2697](https://github.com/clerk/javascript/pull/2697)) by [@clerk-cookie](https://github.com/clerk-cookie)

## 3.60.0

### Minor Changes

- Introduce Protect for authorization. ([#2309](https://github.com/clerk/javascript/pull/2309)) by [@panteliselef](https://github.com/panteliselef)

  Changes in public APIs:

  - Rename Gate to Protect
  - Support for permission checks. (Previously only roles could be used)
  - Remove the `experimental` tags and prefixes
  - Drop `some` from the `has` utility and Protect. Protect now accepts a `condition` prop where a function is expected with the `has` being exposed as the param.
  - Protect can now be used without required props. In this case behaves as `<SignedIn>`, if no authorization props are passed.
  - `has` will throw an error if neither `permission` or `role` is passed.
  - `auth().protect()` for Nextjs App Router. Allow per page protection in app router. This utility will automatically throw a 404 error if user is not authorized or authenticated.
    - inside a page or layout file it will render the nearest `not-found` component set by the developer
    - inside a route handler it will return empty response body with a 404 status code

### Patch Changes

- Adjust `ZxcvbnResult` interface to use current `feedback.warning` type as used in the upstream `@zxcvbn-ts/core` library. ([#2332](https://github.com/clerk/javascript/pull/2332)) by [@clerk-cookie](https://github.com/clerk-cookie)

## 3.59.0

### Minor Changes

- Deprecate `Clerk.isReady()` in favor of `Clerk.loaded` ([#2293](https://github.com/clerk/javascript/pull/2293)) by [@dimkl](https://github.com/dimkl)

## 3.58.1

### Patch Changes

- Add `permissions` to `meta` field of fapi error. ([#2285](https://github.com/clerk/javascript/pull/2285)) by [@clerk-cookie](https://github.com/clerk-cookie)

- Drop `org:sys_domains:delete` and `org:sys_memberships:delete` as those have now been merged with the respective `manage` ones. ([#2270](https://github.com/clerk/javascript/pull/2270)) by [@panteliselef](https://github.com/panteliselef)

## 3.58.0

### Minor Changes

- Add support for custom roles in `<OrganizationProfile/>`. ([#2039](https://github.com/clerk/javascript/pull/2039)) by [@panteliselef](https://github.com/panteliselef)

  The previous roles (`admin` and `basic_member`), are still kept as a fallback.

- Experimental support for `<Gate/>` with role checks. ([#2051](https://github.com/clerk/javascript/pull/2051)) by [@panteliselef](https://github.com/panteliselef)

## 3.57.1

### Patch Changes

- Shows list of domains if member has the `org:sys_domain:read` permission. ([#1896](https://github.com/clerk/javascript/pull/1896)) by [@panteliselef](https://github.com/panteliselef)

- Introduces new element appearance descriptors: ([#2010](https://github.com/clerk/javascript/pull/2010)) by [@clerk-cookie](https://github.com/clerk-cookie)

  - `activeDeviceListItem` allows you to customize the appearance of the active device list (accordion) item
    - `activeDeviceListItem__current` allows you to customize the appearance of the _current_ active device list (accordion) item
  - `activeDevice` allows you to customize the appearance of the active device item
    - `activeDevice__current` allows you to customize the appearance of the _current_ active device item

- Simplify the WithOptions generic type ([#2008](https://github.com/clerk/javascript/pull/2008)) by [@clerk-cookie](https://github.com/clerk-cookie)

## 3.57.0

### Minor Changes

- Introduce customization in `UserProfile` and `OrganizationProfile` ([#1822](https://github.com/clerk/javascript/pull/1822)) by [@anagstef](https://github.com/anagstef)

  The `<UserProfile />` component now allows the addition of custom pages and external links to the navigation sidebar. Custom pages can be created using the `<UserProfile.Page>` component, and external links can be added using the `<UserProfile.Link>` component. The default routes, such as `Account` and `Security`, can be reordered.

  Example React API usage:

  ```tsx
  <UserProfile>
    <UserProfile.Page
      label='Custom Page'
      url='custom'
      labelIcon={<CustomIcon />}
    >
      <MyCustomPageContent />
    </UserProfile.Page>
    <UserProfile.Link
      label='External'
      url='/home'
      labelIcon={<Icon />}
    />
    <UserProfile.Page label='account' />
    <UserProfile.Page label='security' />
  </UserProfile>
  ```

  Custom pages and links should be provided as children using the `<UserButton.UserProfilePage>` and `<UserButton.UserProfileLink>` components when using the `UserButton` component.

  The `<OrganizationProfile />` component now supports the addition of custom pages and external links to the navigation sidebar. Custom pages can be created using the `<OrganizationProfile.Page>` component, and external links can be added using the `<OrganizationProfile.Link>` component. The default routes, such as `Members` and `Settings`, can be reordered.

  Example React API usage:

  ```tsx
  <OrganizationProfile>
    <OrganizationProfile.Page
      label='Custom Page'
      url='custom'
      labelIcon={<CustomIcon />}
    >
      <MyCustomPageContent />
    </OrganizationProfile.Page>
    <OrganizationProfile.Link
      label='External'
      url='/home'
      labelIcon={<Icon />}
    />
    <OrganizationProfile.Page label='members' />
    <OrganizationProfile.Page label='settings' />
  </OrganizationProfile>
  ```

  Custom pages and links should be provided as children using the `<OrganizationSwitcher.OrganizationProfilePage>` and `<OrganizationSwitcher.OrganizationProfileLink>` components when using the `OrganizationSwitcher` component.

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Drop `experimental_force_oauth_first` & `experimental__forceOauthFirst` from `DisplayConfig` ([#1918](https://github.com/clerk/javascript/pull/1918)) by [@dimkl](https://github.com/dimkl)

## 3.56.1

### Patch Changes

- Deprecate experimental captcha from Clerk singleton. ([#1905](https://github.com/clerk/javascript/pull/1905)) by [@panteliselef](https://github.com/panteliselef)

## 3.56.0

### Minor Changes

- Introduces three new element appearence descriptors: ([#1803](https://github.com/clerk/javascript/pull/1803)) by [@octoper](https://github.com/octoper)

  - `tableHead` let's you customize the tables head styles.
  - `paginationButton` let's you customize the pagination buttons.
  - `paginationRowText` let's you customize the pagination text.

### Patch Changes

- Update default organization permissions with a `sys_` prefix as part of the entitlement. This changes makes it easy to distinguish between clerk reserved permissions and custom permissions created by developers. ([#1865](https://github.com/clerk/javascript/pull/1865)) by [@mzhong9723](https://github.com/mzhong9723)

- Mark the following SAML related types as stable: ([#1876](https://github.com/clerk/javascript/pull/1876)) by [@dimkl](https://github.com/dimkl)

  - `User.samlAccounts`
  - `SamlAccount`
  - `UserSettingsResource.saml`
  - `UserSettingsJSON.saml`
  - `SamlSettings`
  - `UserResource.samlAccounts`
  - `SamlAccountResource`
  - `SamlStrategy`
  - `UserJSON.saml_accounts`
  - `SamlAccountJSON`
  - `SamlConfig`
  - `SamlFactor`
  - `HandleSamlCallbackParams`

- Deprecate the `organization.__unstable__invitationUpdate` and `organization.__unstable__membershipUpdate` methods. ([#1879](https://github.com/clerk/javascript/pull/1879)) by [@panteliselef](https://github.com/panteliselef)

- Fix methods in clerk-js that consumede paginated endpoints in order to retrieve single resources. ([#1871](https://github.com/clerk/javascript/pull/1871)) by [@panteliselef](https://github.com/panteliselef)

- In invite members screen of the <OrganizationProfile /> component, consume any invalid email addresses as they are returned in the API error and remove them from the input automatically. ([#1869](https://github.com/clerk/javascript/pull/1869)) by [@chanioxaris](https://github.com/chanioxaris)

## 3.55.0

### Minor Changes

- Add support for LinkedIn OIDC ([#1772](https://github.com/clerk/javascript/pull/1772)) by [@fragoulis](https://github.com/fragoulis)

### Patch Changes

- Introduces a new `isAuthorized()` method in the `Session` class. Returns a promise and checks whether the active user is allowed to perform an action based on the passed (required) permission and the ones attached to the membership. ([#1834](https://github.com/clerk/javascript/pull/1834)) by [@panteliselef](https://github.com/panteliselef)

- Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier. ([#1857](https://github.com/clerk/javascript/pull/1857)) by [@BRKalow](https://github.com/BRKalow)

- Introduce new `*EmailLink*` helpers that will replace the `*MagicLink*` helpers. ([#1833](https://github.com/clerk/javascript/pull/1833)) by [@dimkl](https://github.com/dimkl)

  Also marked all the `*MagicLink*` as deprecated using JSDocs.

## 3.54.0

### Minor Changes

- Introduce a new user resource method to leave an organization. You can now call 'user.leaveOrganization(<org_id>)' when a user chooses to leave an organization instead of 'organization.removeMember(<user_id>)' which is mostly meant for organization based actions. ([#1809](https://github.com/clerk/javascript/pull/1809)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- - Introduce organizationProfileProps as prop in `<OrganizationSwitcher/>`. ([#1801](https://github.com/clerk/javascript/pull/1801)) by [@panteliselef](https://github.com/panteliselef)

  - Introduce appearance in userProfileProps in `<UserButton/>`.
  - Deprecate the usage of `appearance.userProfile` in `<UserButton/>`.

- Introduce ClerkRuntimeError class for localizing error messages in ClerkJS components ([#1813](https://github.com/clerk/javascript/pull/1813)) by [@panteliselef](https://github.com/panteliselef)

- Enables you to translate the tooltip hint while creating an organization through the `formFieldHintText__slug` key ([#1811](https://github.com/clerk/javascript/pull/1811)) by [@LekoArts](https://github.com/LekoArts)

- Drop `password` property from `UserJSON` since it's not being returned by the Frontend API ([#1805](https://github.com/clerk/javascript/pull/1805)) by [@dimkl](https://github.com/dimkl)

- Remove experimenta jsdoc tags from multi-domain types. ([#1819](https://github.com/clerk/javascript/pull/1819)) by [@panteliselef](https://github.com/panteliselef)

- Warn about `publicUserData.profileImageUrl` nested property deprecation in `OrganizationMembership` & `OrganizationMembershipRequest` resources. ([#1812](https://github.com/clerk/javascript/pull/1812)) by [@dimkl](https://github.com/dimkl)

## 3.53.0

### Minor Changes

- `<SignIn/>`, `<SignUp/>`, `<RedirectToSignin/>`, `<RedirectToSignUp/>`, `clerk.redirectToSignIn()` and `clerk.redirectToSignUp()` now accept the `initialValues` option, which will prefill the appropriate form fields with the values provided. ([#1701](https://github.com/clerk/javascript/pull/1701)) by [@desiprisg](https://github.com/desiprisg)

## 3.52.1

### Patch Changes

- Introduces a new method for fetching organization invitations called `Organization.getInvitations`. ([#1766](https://github.com/clerk/javascript/pull/1766)) by [@panteliselef](https://github.com/panteliselef)

  Deprecate `Organization.getPendingInvitations`

- Adds the ability to force users to reset their password. ([#1757](https://github.com/clerk/javascript/pull/1757)) by [@kostaspt](https://github.com/kostaspt)

## 3.52.0

### Minor Changes

- Introduce the new brand-new component OrganizationList ([#1692](https://github.com/clerk/javascript/pull/1692)) by [@panteliselef](https://github.com/panteliselef)

  - Lists all the memberships, invitations or suggestions an active user may have
  - Powered by our `useOrganizationList` react hook

### Patch Changes

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- This PR replaces `The verification link expired. Please resend it.` message with the localization key `formFieldError__verificationLinkExpired`. The english message was also adjust to `The verification link expired. Please request a new link.` to make the second sentence clearer. ([#1738](https://github.com/clerk/javascript/pull/1738)) by [@LekoArts](https://github.com/LekoArts)

## 3.51.0

### Minor Changes

- Introduced a new `firstFactorUrl` property in sign-in callback to handle unverified emails. ([#1629](https://github.com/clerk/javascript/pull/1629)) by [@kostaspt](https://github.com/kostaspt)

### Patch Changes

- Organization Switcher now diplays organization invitations and suggestions in a more compact form. ([#1675](https://github.com/clerk/javascript/pull/1675)) by [@panteliselef](https://github.com/panteliselef)

## 3.50.0

### Minor Changes

- Introducing validatePassword for SignIn and SignUp resources ([#1445](https://github.com/clerk/javascript/pull/1445)) by [@panteliselef](https://github.com/panteliselef)

  - Validate a password based on the instance's configuration set in Password Policies in Dashboard

- Introduce a new resource called OrganizationSuggestion along with retrieve() & accept() methods ([#1574](https://github.com/clerk/javascript/pull/1574)) by [@chanioxaris](https://github.com/chanioxaris)

  Also make available the user's suggestions from the useOrganizationList hook

- Introduces userInvitations from `useOrganizationList` ([#1520](https://github.com/clerk/javascript/pull/1520)) by [@panteliselef](https://github.com/panteliselef)

  `userInvitations` is a paginated list of data. It can be used to create Paginated tables or Infinite lists.

- Introduce `hasImage` in User / Organization / Session resources ([#1544](https://github.com/clerk/javascript/pull/1544)) by [@dimkl](https://github.com/dimkl)

- Improve redirects on OAuth callback. Now, if you try to sign up with a provider that allows unverified accounts, it will ([#1563](https://github.com/clerk/javascript/pull/1563)) by [@kostaspt](https://github.com/kostaspt)

  navigate to the appropriate change when needed, fixing the broken flow.

- Introduce `logoLinkUrl` prop in `appearance.layout` ([#1449](https://github.com/clerk/javascript/pull/1449)) by [@nikospapcom](https://github.com/nikospapcom)

  A new `logoLinkUrl` prop has been added to `appearance.layout` and used in `ApplicationLogo` to change the `href` of the link.
  By default, the logo link url will be the Home URL you've set in the Clerk Dashboard.

### Patch Changes

- Introduces a new resource called OrganizationMembership ([#1572](https://github.com/clerk/javascript/pull/1572)) by [@panteliselef](https://github.com/panteliselef)

  - useOrganization has been updated in order to return a list of domain with the above type

- Introduces Membership Requests in <OrganizationProfile /> ([#1576](https://github.com/clerk/javascript/pull/1576)) by [@panteliselef](https://github.com/panteliselef)

  - This is a list of users that have requested to join the active organization

- Updates signature of OrganizationMembership.retrieve to support backwards compatibility while allowing using the new paginated responses. ([#1606](https://github.com/clerk/javascript/pull/1606)) by [@panteliselef](https://github.com/panteliselef)

  - userMemberships is now also part of the returned values of useOrganizationList

- Introduces the accept method in UserOrganizationInvitation class ([#1550](https://github.com/clerk/javascript/pull/1550)) by [@panteliselef](https://github.com/panteliselef)

- Display a notification counter for organization invitations in OrganizationSwitcher ([#1627](https://github.com/clerk/javascript/pull/1627)) by [@panteliselef](https://github.com/panteliselef)

- Introduces a new resource called OrganizationDomain ([#1569](https://github.com/clerk/javascript/pull/1569)) by [@panteliselef](https://github.com/panteliselef)

  - useOrganization has been updated in order to return a list of domain with the above type

- Introduces domains and invitations in <OrganizationProfile /> ([#1560](https://github.com/clerk/javascript/pull/1560)) by [@panteliselef](https://github.com/panteliselef)

  - The "Members" page now accommodates Domain and Individual invitations
  - The "Settings" page allows for the addition, edit and removal of a domain

- A OrganizationMembershipRequest can now be rejected ([#1612](https://github.com/clerk/javascript/pull/1612)) by [@panteliselef](https://github.com/panteliselef)

  - New `OrganizationMembershipRequest.reject` method alongside `accept`
  - As an organization admin, navigate to `Organization Profile` > `Members` > `Requests`. You can now reject a request from the table.

- Introduces an invitation list within <OrganizationSwitcher/> ([#1554](https://github.com/clerk/javascript/pull/1554)) by [@panteliselef](https://github.com/panteliselef)

  - Users can accept the invitation that is sent to them

- When updating enrollment mode of a domain uses can now delete any pending invitations or suggestions. ([#1632](https://github.com/clerk/javascript/pull/1632)) by [@panteliselef](https://github.com/panteliselef)

- Construct urls based on context in <OrganizationSwitcher/> ([#1503](https://github.com/clerk/javascript/pull/1503)) by [@panteliselef](https://github.com/panteliselef)

  - Deprecate `afterSwitchOrganizationUrl`
  - Introduce `afterSelectOrganizationUrl` & `afterSelectPersonalUrl`

  `afterSelectOrganizationUrl` accepts

  - Full URL -> 'https://clerk.com/'
  - relative path -> '/organizations'
  - relative path -> with param '/organizations/:id'
  - function that returns a string -> (org) => `/org/${org.slug}`
    `afterSelectPersonalUrl` accepts
  - Full URL -> 'https://clerk.com/'
  - relative path -> '/users'
  - relative path -> with param '/users/:username'
  - function that returns a string -> (user) => `/users/${user.id}`

- Introduces list of suggestions within <OrganizationSwitcher/> ([#1577](https://github.com/clerk/javascript/pull/1577)) by [@panteliselef](https://github.com/panteliselef)

  - Users can request to join a suggested organization

## 3.49.0

### Minor Changes

- Handle the construction of zxcvbn errors with information from FAPI ([#1526](https://github.com/clerk/javascript/pull/1526)) by [@raptisj](https://github.com/raptisj)

### Patch Changes

- Deprecate usage of old image fields in favor of `imageUrl` ([#1543](https://github.com/clerk/javascript/pull/1543)) by [@dimkl](https://github.com/dimkl)

- New localization keys for max length exceeded validation: ([#1521](https://github.com/clerk/javascript/pull/1521)) by [@nikospapcom](https://github.com/nikospapcom)

  - Organization name (form_param_max_length_exceeded\_\_name)
  - First name (form_param_max_length_exceeded\_\_first_name)
  - Last name (form_param_max_length_exceeded\_\_last_name)

- Introduces a new internal class `UserOrganizationInvitation` that represents and invitation to join an organization with the organization data populated ([#1527](https://github.com/clerk/javascript/pull/1527)) by [@panteliselef](https://github.com/panteliselef)

  Additions to support the above

  - UserOrganizationInvitationResource
  - UserOrganizationInvitationJSON
  - ClerkPaginatedResponse

  ClerkPaginatedResponse represents a paginated FAPI response

- Introduce Clerk.client.clearCache() method ([#1545](https://github.com/clerk/javascript/pull/1545)) by [@SokratisVidros](https://github.com/SokratisVidros)

## 3.48.1

### Patch Changes

- Introduce the `skipInvitationScreen` prop on `<CreateOrganization />` component ([#1501](https://github.com/clerk/javascript/pull/1501)) by [@panteliselef](https://github.com/panteliselef)

## 3.48.0

### Minor Changes

- Add unsafeMetadata prop to the SignUp component ([#1464](https://github.com/clerk/javascript/pull/1464)) by [@tmilewski](https://github.com/tmilewski)

## 3.47.0

### Minor Changes

- Add a confirmation input as an additional check when doing destructive actions such as: ([#1454](https://github.com/clerk/javascript/pull/1454)) by [@raptisj](https://github.com/raptisj)

  - delete an organization
  - delete a user account
  - leave an organization

  Νew localization keys were introduced to support the above

### Patch Changes

- Add missing property 'maxAllowedMemberships' in Organization resource ([#1468](https://github.com/clerk/javascript/pull/1468)) by [@chanioxaris](https://github.com/chanioxaris)

- Add `form_username_invalid_character` unstable error localization key. ([#1475](https://github.com/clerk/javascript/pull/1475)) by [@desiprisg](https://github.com/desiprisg)

- Add missing property 'privateMetadata' in OrganizationInvitation resource ([#1468](https://github.com/clerk/javascript/pull/1468)) by [@chanioxaris](https://github.com/chanioxaris)

- Enable the ability to target the avatar upload and remove action buttons ([#1455](https://github.com/clerk/javascript/pull/1455)) by [@tmilewski](https://github.com/tmilewski)

## 3.46.1

### Patch Changes

- Add missing `create` method to `PhoneNumberResource`, `EmailAddressResource`, `Web3WalletResource` interfaces ([#1411](https://github.com/clerk/javascript/pull/1411)) by [@crutchcorn](https://github.com/crutchcorn)

## 3.46.0

### Minor Changes

- Add ability for organization admins to delete an organization if they have permission to do so ([#1368](https://github.com/clerk/javascript/pull/1368)) by [@jescalan](https://github.com/jescalan)

## 3.45.0

### Minor Changes

- If user does not have permission to create an org, create org button will not display in the OrganizationSwitcher UI ([#1373](https://github.com/clerk/javascript/pull/1373)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Fix to pull from the correct permissions set when displaying user delete self UI ([#1372](https://github.com/clerk/javascript/pull/1372)) by [@jescalan](https://github.com/jescalan)

## 3.44.0

### Minor Changes

- Add localization keys for when the phone number exists and the last identification is deleted ([#1383](https://github.com/clerk/javascript/pull/1383)) by [@raptisj](https://github.com/raptisj)

## 3.43.0

### Minor Changes

- Adds the ability for users to delete their own accounts, as long as they have permission to do so ([#1307](https://github.com/clerk/javascript/pull/1307)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Password, first name & last name fields will be disabled if there are active SAML accounts. ([#1326](https://github.com/clerk/javascript/pull/1326)) by [@yourtallness](https://github.com/yourtallness)

## 3.42.0

### Minor Changes

- Add base64 string support in Organization.setLogo ([#1309](https://github.com/clerk/javascript/pull/1309)) by [@raptisj](https://github.com/raptisj)

## 3.41.1

### Patch Changes

- fix(types,localizations): Improve invalid form email_address param error message by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Make first name, last name & password readonly for users with active SAML accounts by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Add support for dataURLs in User.setProfileImage by [@nikosdouvlis](https://github.com/nikosdouvlis)

## [3.41.0](https://github.com/clerk/javascript/compare/@clerk/types@3.41.0-staging.1...@clerk/types@3.41.0) (2023-06-03)

**Note:** Version bump only for package @clerk/types

## [3.40.0](https://github.com/clerk/javascript/compare/@clerk/types@3.40.0-staging.0...@clerk/types@3.40.0) (2023-05-26)

**Note:** Version bump only for package @clerk/types

## [3.39.0](https://github.com/clerk/javascript/compare/@clerk/types@3.39.0-staging.1...@clerk/types@3.39.0) (2023-05-23)

**Note:** Version bump only for package @clerk/types

### [3.38.1](https://github.com/clerk/javascript/compare/@clerk/types@3.38.1-staging.0...@clerk/types@3.38.1) (2023-05-18)

**Note:** Version bump only for package @clerk/types

## [3.38.0](https://github.com/clerk/javascript/compare/@clerk/types@3.38.0-staging.1...@clerk/types@3.38.0) (2023-05-17)

**Note:** Version bump only for package @clerk/types

## [3.37.0](https://github.com/clerk/javascript/compare/@clerk/types@3.37.0-staging.3...@clerk/types@3.37.0) (2023-05-15)

**Note:** Version bump only for package @clerk/types

## [3.36.0](https://github.com/clerk/javascript/compare/@clerk/types@3.36.0-staging.4...@clerk/types@3.36.0) (2023-05-04)

**Note:** Version bump only for package @clerk/types

## [3.36.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/types@3.36.0-staging.3...@clerk/types@3.36.0-staging.4) (2023-05-04)

### Features

- **clerk-js,types:** Support sign in with SAML strategy ([6da395f](https://github.com/clerk/javascript/commit/6da395fd785467aa934896942408bdb5f64aa887))
- **clerk-js,types:** Support sign up with SAML strategy ([6d9c93e](https://github.com/clerk/javascript/commit/6d9c93e9d782f17bbddde1e68c2ce977415b45db))
- **clerk-js:** Use allowed special characters for password from environment ([dec0512](https://github.com/clerk/javascript/commit/dec05120c180e53595e87817a2f44ef62af0f4f1))

## [3.36.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/types@3.36.0-staging.2...@clerk/types@3.36.0-staging.3) (2023-05-02)

### Features

- **clerk-js:** Add resetPasswordFlow to SignIn resource ([6155f5b](https://github.com/clerk/javascript/commit/6155f5bde6fe0a140bffb7d8087c2246716abf7e))
- **clerk-js:** Create <ResetPasswordSuccess /> page ([3fbf8e7](https://github.com/clerk/javascript/commit/3fbf8e7157774412096ff432e622540ae2d96ef4))
- **clerk-js:** Introduce Reset Password flow ([e903c4f](https://github.com/clerk/javascript/commit/e903c4f430ae629625177637bb14f965a37596e1))
- **clerk-js:** Localize "Password don't match" field error ([c573599](https://github.com/clerk/javascript/commit/c573599a370d4f3925d0e8a87b37f28f157bb62b))
- **clerk-js:** Reset password for first factor ([280b5df](https://github.com/clerk/javascript/commit/280b5df2428b790e679a04004461aadb2717ae2b))
- **clerk-js:** Reset password MFA ([5978756](https://github.com/clerk/javascript/commit/5978756640bc5f5bb4726f72ca2e53ba43f009d6))

### Bug Fixes

- **clerk-js,types:** Remove after_sign_out_url as it not returned by FAPI ([#1121](https://github.com/clerk/javascript/issues/1121)) ([d87493d](https://github.com/clerk/javascript/commit/d87493d13e2c7a3ffbf37ba728e6cde7f6f14682))
- **clerk-js:** Reset Password missing localization keys ([b1df074](https://github.com/clerk/javascript/commit/b1df074ad203e07b55b0051c9f97d4fd26e0fde5))
- **clerk-js:** Update type of resetPasswordFlow in SignInResource ([637b791](https://github.com/clerk/javascript/commit/637b791b0086be35a67e7d8a6a0e7c42989296b5))

### [3.35.3](https://github.com/clerk/javascript/compare/@clerk/types@3.35.3-staging.0...@clerk/types@3.35.3) (2023-04-19)

**Note:** Version bump only for package @clerk/types

### [3.35.2](https://github.com/clerk/javascript/compare/@clerk/types@3.35.1...@clerk/types@3.35.2) (2023-04-19)

### Bug Fixes

- **clerk-js:** Add resetPassword method as a core resource ([fa70749](https://github.com/clerk/javascript/commit/fa70749c3bc0e37433b314ea9e12c5153bf60e0e))
- **clerk-js:** Refactor types for resetPassword ([fd53901](https://github.com/clerk/javascript/commit/fd53901c0fd4ce7c7c81a9239d4818002b83f58c))

### [3.35.1](https://github.com/clerk/javascript/compare/@clerk/types@3.35.1-staging.0...@clerk/types@3.35.1) (2023-04-12)

**Note:** Version bump only for package @clerk/types

## [3.35.0](https://github.com/clerk/javascript/compare/@clerk/types@3.35.0-staging.3...@clerk/types@3.35.0) (2023-04-11)

**Note:** Version bump only for package @clerk/types

## [3.34.0](https://github.com/clerk/javascript/compare/@clerk/types@3.34.0-staging.0...@clerk/types@3.34.0) (2023-04-06)

**Note:** Version bump only for package @clerk/types

## [3.33.0](https://github.com/clerk/javascript/compare/@clerk/types@3.33.0-staging.2...@clerk/types@3.33.0) (2023-03-31)

**Note:** Version bump only for package @clerk/types

## [3.32.0](https://github.com/clerk/javascript/compare/@clerk/types@3.32.0-staging.0...@clerk/types@3.32.0) (2023-03-29)

**Note:** Version bump only for package @clerk/types

### [3.30.1](https://github.com/clerk/javascript/compare/@clerk/types@3.30.1-staging.2...@clerk/types@3.30.1) (2023-03-10)

**Note:** Version bump only for package @clerk/types

## [3.30.0](https://github.com/clerk/javascript/compare/@clerk/types@3.30.0-staging.0...@clerk/types@3.30.0) (2023-03-09)

**Note:** Version bump only for package @clerk/types

## [3.29.0](https://github.com/clerk/javascript/compare/@clerk/types@3.29.0-staging.0...@clerk/types@3.29.0) (2023-03-07)

**Note:** Version bump only for package @clerk/types

### [3.28.5](https://github.com/clerk/javascript/compare/@clerk/types@3.28.5-staging.1...@clerk/types@3.28.5) (2023-03-03)

**Note:** Version bump only for package @clerk/types

### [3.28.4](https://github.com/clerk/javascript/compare/@clerk/types@3.28.4-staging.0...@clerk/types@3.28.4) (2023-03-01)

**Note:** Version bump only for package @clerk/types

### [3.28.3](https://github.com/clerk/javascript/compare/@clerk/types@3.28.3-staging.0...@clerk/types@3.28.3) (2023-02-25)

**Note:** Version bump only for package @clerk/types

### [3.28.2](https://github.com/clerk/javascript/compare/@clerk/types@3.28.2-staging.3...@clerk/types@3.28.2) (2023-02-24)

**Note:** Version bump only for package @clerk/types

### [3.28.2-staging.2](https://github.com/clerk/javascript/compare/@clerk/types@3.28.2-staging.1...@clerk/types@3.28.2-staging.2) (2023-02-22)

### Bug Fixes

- **clerk-js:** Pass unsafe metadata to sign up methods ([e2510e6](https://github.com/clerk/javascript/commit/e2510e65b726c113de977fb8252cdcd708ad9bb7))

### [3.28.1](https://github.com/clerk/javascript/compare/@clerk/types@3.28.1-staging.0...@clerk/types@3.28.1) (2023-02-17)

**Note:** Version bump only for package @clerk/types

## [3.28.0](https://github.com/clerk/javascript/compare/@clerk/types@3.28.0-staging.0...@clerk/types@3.28.0) (2023-02-15)

**Note:** Version bump only for package @clerk/types

## [3.27.0](https://github.com/clerk/javascript/compare/@clerk/types@3.27.0-staging.1...@clerk/types@3.27.0) (2023-02-10)

**Note:** Version bump only for package @clerk/types

### [3.26.1](https://github.com/clerk/javascript/compare/@clerk/types@3.26.1-staging.0...@clerk/types@3.26.1) (2023-02-07)

**Note:** Version bump only for package @clerk/types

### [3.26.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/types@3.26.0...@clerk/types@3.26.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/types

## [3.26.0](https://github.com/clerk/javascript/compare/@clerk/types@3.26.0-staging.1...@clerk/types@3.26.0) (2023-02-07)

**Note:** Version bump only for package @clerk/types

### [3.25.1](https://github.com/clerk/javascript/compare/@clerk/types@3.25.1-staging.0...@clerk/types@3.25.1) (2023-02-01)

**Note:** Version bump only for package @clerk/types

## [3.25.0](https://github.com/clerk/javascript/compare/@clerk/types@3.25.0-staging.1...@clerk/types@3.25.0) (2023-01-27)

**Note:** Version bump only for package @clerk/types

### [3.24.1](https://github.com/clerk/javascript/compare/@clerk/types@3.24.0...@clerk/types@3.24.1) (2023-01-20)

### Bug Fixes

- **nextjs,types:** Make frontendApi or publishableKey mutually exclusive but optional ([953c276](https://github.com/clerk/javascript/commit/953c27622ba24054172d6f4178bd5af50f73fa36))

## [3.24.0](https://github.com/clerk/javascript/compare/@clerk/types@3.24.0-staging.1...@clerk/types@3.24.0) (2023-01-17)

**Note:** Version bump only for package @clerk/types

## [3.23.0](https://github.com/clerk/javascript/compare/@clerk/types@3.23.0-staging.1...@clerk/types@3.23.0) (2022-12-19)

**Note:** Version bump only for package @clerk/types

### [3.22.2](https://github.com/clerk/javascript/compare/@clerk/types@3.22.2-staging.0...@clerk/types@3.22.2) (2022-12-13)

**Note:** Version bump only for package @clerk/types

### [3.22.1](https://github.com/clerk/javascript/compare/@clerk/types@3.22.0...@clerk/types@3.22.1) (2022-12-12)

**Note:** Version bump only for package @clerk/types

## [3.22.0](https://github.com/clerk/javascript/compare/@clerk/types@3.22.0-staging.1...@clerk/types@3.22.0) (2022-12-09)

**Note:** Version bump only for package @clerk/types

### [3.21.1](https://github.com/clerk/javascript/compare/@clerk/types@3.21.0...@clerk/types@3.21.1) (2022-12-08)

### Reverts

- Revert "feat(clerk-js,types): Terse paths parameters (#572)" (#603) ([d535eac](https://github.com/clerk/javascript/commit/d535eace3d7733ce3b848bb05f1b0c02e5faf15d)), closes [#572](https://github.com/clerk/javascript/issues/572) [#603](https://github.com/clerk/javascript/issues/603)

## [3.21.0](https://github.com/clerk/javascript/compare/@clerk/types@3.21.0-staging.0...@clerk/types@3.21.0) (2022-12-08)

**Note:** Version bump only for package @clerk/types

## [3.20.0](https://github.com/clerk/javascript/compare/@clerk/types@3.20.0-staging.0...@clerk/types@3.20.0) (2022-12-02)

**Note:** Version bump only for package @clerk/types

## [3.19.0](https://github.com/clerk/javascript/compare/@clerk/types@3.19.0-staging.4...@clerk/types@3.19.0) (2022-11-30)

**Note:** Version bump only for package @clerk/types

## [3.19.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/types@3.19.0-staging.3...@clerk/types@3.19.0-staging.4) (2022-11-29)

**Note:** Version bump only for package @clerk/types

## [3.18.0](https://github.com/clerk/javascript/compare/@clerk/types@3.18.0-staging.0...@clerk/types@3.18.0) (2022-11-25)

**Note:** Version bump only for package @clerk/types

### [3.17.2](https://github.com/clerk/javascript/compare/@clerk/types@3.17.2-staging.0...@clerk/types@3.17.2) (2022-11-25)

**Note:** Version bump only for package @clerk/types

### [3.17.1](https://github.com/clerk/javascript/compare/@clerk/types@3.17.0...@clerk/types@3.17.1) (2022-11-23)

**Note:** Version bump only for package @clerk/types

## [3.17.0](https://github.com/clerk/javascript/compare/@clerk/types@3.17.0-staging.2...@clerk/types@3.17.0) (2022-11-22)

**Note:** Version bump only for package @clerk/types

## [3.17.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/types@3.17.0-staging.1...@clerk/types@3.17.0-staging.2) (2022-11-21)

### Features

- **types:** Introduce Xero & Box OAuth provider types ([d7da1f2](https://github.com/clerk/javascript/commit/d7da1f2cbefef2841781202ac2853402c0b8eb2b))

### [3.16.1](https://github.com/clerk/javascript/compare/@clerk/types@3.16.1-staging.1...@clerk/types@3.16.1) (2022-11-18)

**Note:** Version bump only for package @clerk/types

## [3.16.0](https://github.com/clerk/javascript/compare/@clerk/types@3.16.0-staging.0...@clerk/types@3.16.0) (2022-11-15)

**Note:** Version bump only for package @clerk/types

### [3.15.1](https://github.com/clerk/javascript/compare/@clerk/types@3.15.1-staging.1...@clerk/types@3.15.1) (2022-11-10)

**Note:** Version bump only for package @clerk/types

## [3.15.0](https://github.com/clerk/javascript/compare/@clerk/types@3.15.0-staging.1...@clerk/types@3.15.0) (2022-11-05)

### Features

- **types,clerk-js:** Introduce OrganizationSettings resource ([455911f](https://github.com/clerk/javascript/commit/455911f4166e4bea00aa62b32a05bef297983c61))

## [3.14.0](https://github.com/clerk/javascript/compare/@clerk/types@3.14.0-staging.7...@clerk/types@3.14.0) (2022-11-03)

**Note:** Version bump only for package @clerk/types

## [3.14.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/types@3.14.0-staging.3...@clerk/types@3.14.0-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/types

## [3.14.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/types@3.14.0-staging.1...@clerk/types@3.14.0-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/types

## [3.14.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/types@3.14.0-staging.1...@clerk/types@3.14.0-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/types

## [3.14.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/types@3.13.0...@clerk/types@3.14.0-staging.1) (2022-11-02)

### Features

- **clerk-js,types:** Organization invitation metadata ([87764b8](https://github.com/clerk/javascript/commit/87764b839cc65455347e1c19b15f4a17603201b8))
- **clerk-js:** Add `loaded` to core Clerk instance ([7c08a91](https://github.com/clerk/javascript/commit/7c08a914d674f05608503898542b907886465b7e))

## [3.13.0](https://github.com/clerk/javascript/compare/@clerk/types@3.13.0-staging.0...@clerk/types@3.13.0) (2022-10-24)

**Note:** Version bump only for package @clerk/types

## [3.12.0](https://github.com/clerk/javascript/compare/@clerk/types@3.11.0...@clerk/types@3.12.0) (2022-10-14)

### Features

- **types,clerk-js:** List only authenticatable OAuth providers in Sign in/up components ([4b3f1e6](https://github.com/clerk/javascript/commit/4b3f1e67d655dfb3e818ce9015b68b369d7a1bd4))

## [3.11.0](https://github.com/clerk/javascript/compare/@clerk/types@3.11.0-staging.2...@clerk/types@3.11.0) (2022-10-14)

**Note:** Version bump only for package @clerk/types

## [3.11.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/types@3.10.1...@clerk/types@3.11.0-staging.1) (2022-10-13)

### Features

- **clerk-js,clerk-react,types:** Wire up `OrganizationSwitcher` and `OrganizationProfile` ([1e34e69](https://github.com/clerk/javascript/commit/1e34e6986ee49aeb9ca9f72cdc5d799d6611b53f))
- **clerk-js:** Add table and pagination elements ([cb56f5c](https://github.com/clerk/javascript/commit/cb56f5c0313ba6f1fce50eae6fc3e3d596cf1b16))

### Bug Fixes

- **clerk-js:** Add appearance customization support for avatar gradient ([96cde45](https://github.com/clerk/javascript/commit/96cde45b4f1db5ff074289b57ff58c40bf80f6e1))
- **clerk-js:** Add global not_allowed_access error to localization prop ([0313fe5](https://github.com/clerk/javascript/commit/0313fe5ce4e0afca20865ad1b6d0503502ea6e4d))
- **types:** Remove unused hideNavigation prop from UserProfile ([21cafcb](https://github.com/clerk/javascript/commit/21cafcb488d66f90a3b0a13a2079d9b0473ecf7e))

### [3.10.1](https://github.com/clerk/javascript/compare/@clerk/types@3.10.1-staging.0...@clerk/types@3.10.1) (2022-10-07)

**Note:** Version bump only for package @clerk/types

## [3.10.0](https://github.com/clerk/javascript/compare/@clerk/types@3.10.0-staging.0...@clerk/types@3.10.0) (2022-10-05)

**Note:** Version bump only for package @clerk/types

## [3.9.0](https://github.com/clerk/javascript/compare/@clerk/types@3.9.0-staging.2...@clerk/types@3.9.0) (2022-10-03)

### Features

- **clerk-js:** Add open prop in user button ([6ae7f42](https://github.com/clerk/javascript/commit/6ae7f4226f4db5760e04ee812a494beb66ab2502))

### Bug Fixes

- **clerk-js:** Refactor defaultOpen prop ([1d7b0a9](https://github.com/clerk/javascript/commit/1d7b0a997a86686644d28ac58d0bd7143af9023f))
- **clerk-js:** Refactor isOpen prop ([044860f](https://github.com/clerk/javascript/commit/044860f7204988876b258141108d0e1741204bc1))

## [3.8.0](https://github.com/clerk/javascript/compare/@clerk/types@3.8.0-staging.4...@clerk/types@3.8.0) (2022-09-29)

**Note:** Version bump only for package @clerk/types

### [3.7.1](https://github.com/clerk/javascript/compare/@clerk/types@3.7.0...@clerk/types@3.7.1) (2022-09-25)

**Note:** Version bump only for package @clerk/types

## [3.7.0](https://github.com/clerk/javascript/compare/@clerk/types@3.7.0-staging.1...@clerk/types@3.7.0) (2022-09-24)

**Note:** Version bump only for package @clerk/types

## [3.6.0](https://github.com/clerk/javascript/compare/@clerk/types@3.6.0-staging.0...@clerk/types@3.6.0) (2022-09-22)

**Note:** Version bump only for package @clerk/types

### [3.5.1](https://github.com/clerk/javascript/compare/@clerk/types@3.5.0-staging.4...@clerk/types@3.5.1) (2022-09-19)

### Bug Fixes

- **types:** Completely remove totp2Fa.resendButton key ([434fae5](https://github.com/clerk/javascript/commit/434fae5803122c825ce6da8ca2dccad13889605b))

## [3.5.0](https://github.com/clerk/javascript/compare/@clerk/types@3.5.0-staging.4...@clerk/types@3.5.0) (2022-09-16)

### Bug Fixes

- **types:** Completely remove totp2Fa.resendButton key ([434fae5](https://github.com/clerk/javascript/commit/434fae5803122c825ce6da8ca2dccad13889605b))

### [3.4.2](https://github.com/clerk/javascript/compare/@clerk/types@3.4.2-staging.0...@clerk/types@3.4.2) (2022-09-07)

**Note:** Version bump only for package @clerk/types

### [3.4.1](https://github.com/clerk/javascript/compare/@clerk/types@3.4.1-staging.0...@clerk/types@3.4.1) (2022-08-29)

**Note:** Version bump only for package @clerk/types

## [3.4.0](https://github.com/clerk/javascript/compare/@clerk/types@3.4.0-staging.0...@clerk/types@3.4.0) (2022-08-29)

**Note:** Version bump only for package @clerk/types

### [3.3.1](https://github.com/clerk/javascript/compare/@clerk/types@3.3.1-staging.0...@clerk/types@3.3.1) (2022-08-24)

**Note:** Version bump only for package @clerk/types

## [3.3.0](https://github.com/clerk/javascript/compare/@clerk/types@3.2.0...@clerk/types@3.3.0) (2022-08-18)

### Features

- **types:** Introduce Instagram OAuth ([2991b01](https://github.com/clerk/javascript/commit/2991b011bf8002ed9a9c88fbe4cb911665201245))

## [3.2.0](https://github.com/clerk/javascript/compare/@clerk/types@3.2.0-staging.0...@clerk/types@3.2.0) (2022-08-18)

**Note:** Version bump only for package @clerk/types

### [3.1.1](https://github.com/clerk/javascript/compare/@clerk/types@3.1.0...@clerk/types@3.1.1) (2022-08-16)

### Bug Fixes

- **types:** Deprecate orgs session token claim, add org_slug for active organization ([4175040](https://github.com/clerk/javascript/commit/4175040ca2257265cc0b8c12389056933765040b))

## [3.1.0](https://github.com/clerk/javascript/compare/@clerk/types@3.1.0-staging.0...@clerk/types@3.1.0) (2022-08-09)

### Bug Fixes

- **clerk-js:** Introduce more selectors ([bf4c3b3](https://github.com/clerk/javascript/commit/bf4c3b372c7e74b1b42ce53cb7254e54b67c7815))

### [3.0.1](https://github.com/clerk/javascript/compare/@clerk/types@3.0.0...@clerk/types@3.0.1) (2022-08-07)

**Note:** Version bump only for package @clerk/types

## [3.0.0](https://github.com/clerk/javascript/compare/@clerk/types@3.0.0-staging.1...@clerk/types@3.0.0) (2022-08-05)

**Note:** Version bump only for package @clerk/types

## [2.21.0](https://github.com/clerk/javascript/compare/@clerk/types@2.20.0...@clerk/types@2.21.0) (2022-08-04)

### Features

- **clerk-js:** Get support email from FAPI /v1/environment if exists ([c9bb8d7](https://github.com/clerk/javascript/commit/c9bb8d7aaf3958207d4799bdd30e3b15b2890a5d))

## [2.20.0](https://github.com/clerk/javascript/compare/@clerk/types@2.19.1...@clerk/types@2.20.0) (2022-07-13)

### Features

- **types,clerk-react,nextjs:** Add loadOrg option for Next.js withServerSideAuth middleware ([0889bde](https://github.com/clerk/javascript/commit/0889bde9bc7f9e1a5d4c1e706c49212e1f7b36f4))

### Bug Fixes

- **types:** Typo rename Line to LINE ([79b3dd5](https://github.com/clerk/javascript/commit/79b3dd581e9750ac943d9a7a1091a37a48647538))

### [2.19.1](https://github.com/clerk/javascript/compare/@clerk/types@2.19.0...@clerk/types@2.19.1) (2022-07-07)

### Bug Fixes

- **types:** Proper documentation url for OAuth providers ([4398cb2](https://github.com/clerk/javascript/commit/4398cb2ce0914ecd4850b1e3ccbbe64d3d25b031))

## [2.19.0](https://github.com/clerk/javascript/compare/@clerk/types@2.18.0...@clerk/types@2.19.0) (2022-07-06)

### Features

- **types:** Introduce Line OAuth ([e9d429d](https://github.com/clerk/javascript/commit/e9d429d63fcfacd3d393fa9e104e8a1b46f41a67))

## [2.18.0](https://github.com/clerk/javascript/compare/@clerk/types@2.17.0...@clerk/types@2.18.0) (2022-07-01)

### Features

- **types,clerk-js:** Introduce user hasVerifiedEmailAddress & hasVerifiedPhoneNumber attributes ([ea68447](https://github.com/clerk/javascript/commit/ea684473697c33b7b5d8930fe24b7667f6edeaad))

## [2.17.0](https://github.com/clerk/javascript/compare/@clerk/types@2.16.0...@clerk/types@2.17.0) (2022-06-24)

### Features

- **clerk-js:** Add supportEmail property option ([71eff74](https://github.com/clerk/javascript/commit/71eff74383bcd1c3044cfd42ceae70de5b246e68))
- **types,backend-core:** Add org_role, org_id claims ([03da4cf](https://github.com/clerk/javascript/commit/03da4cffee2e5c493d0219d417842a13e066ffe6))
- **types,backend-core:** Consolidate Clerk issued JWT claims under ClerkJWTClaims ([e6bc9fb](https://github.com/clerk/javascript/commit/e6bc9fb380d38d7f89cc2059e0211b0ad55bd1a5))

### Bug Fixes

- **edge,nextjs,remix,clerk-sdk-node,types:** Correct SSR claims typing ([09c147c](https://github.com/clerk/javascript/commit/09c147c196c08e64794423f9eae791bfe453b858))

## [2.16.0](https://github.com/clerk/javascript/compare/@clerk/types@2.16.0-staging.0...@clerk/types@2.16.0) (2022-06-16)

**Note:** Version bump only for package @clerk/types

## [2.15.0](https://github.com/clerk/javascript/compare/@clerk/types@2.15.0-staging.3...@clerk/types@2.15.0) (2022-06-06)

**Note:** Version bump only for package @clerk/types

## [2.15.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/types@2.15.0-staging.2...@clerk/types@2.15.0-staging.3) (2022-06-03)

### Bug Fixes

- **clerk-js,types:** Typo for MetaMask web3 provider name ([922dcb5](https://github.com/clerk/javascript/commit/922dcb52f406a17da8038cafaf10353b15aab2bf))

## [2.15.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/types@2.15.0-staging.1...@clerk/types@2.15.0-staging.2) (2022-06-02)

### Features

- **types,clerk-js:** Support required/optional email/phone for Progressive sign up instances ([13da457](https://github.com/clerk/javascript/commit/13da4576a08e4e396fa48605ecf61accc06057d5))

## [2.15.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/types@2.15.0-staging.0...@clerk/types@2.15.0-staging.1) (2022-06-01)

### Features

- **types,clerk-js:** Introduce web3 wallet operations in UserProfile ([6570a87](https://github.com/clerk/javascript/commit/6570a87439d92a59057b2df50ec482511428495e))

### Bug Fixes

- **clerk-js:** Emit changes in organization to listeners ([798ee62](https://github.com/clerk/javascript/commit/798ee622e7961d3aa7f8842184f5fadbcfed517f))
- **types,clerk-js:** Same component navigate after OAuth flow with missing requirements ([39ca6ce](https://github.com/clerk/javascript/commit/39ca6cee3a8a160fdf0ca95a713707afee55f1fc))

## [2.14.0](https://github.com/clerk/javascript/compare/@clerk/types@2.14.0-staging.1...@clerk/types@2.14.0) (2022-05-20)

**Note:** Version bump only for package @clerk/types

## [2.14.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/types@2.13.0...@clerk/types@2.14.0-staging.1) (2022-05-18)

### Features

- **types,clerk-js:** Enhance Web3 wallet resource with relevant operations ([a166716](https://github.com/clerk/javascript/commit/a166716db44db8e765e67c154093c9d3c3f24c75))
- **types:** Include new organization role `guest_member` ([ba7f27b](https://github.com/clerk/javascript/commit/ba7f27b42be283f9b7b4126cecc8d93ab9a6f04e))

### Bug Fixes

- **clerk-js:** Navigate to sign up continue in web3 ([460ba1c](https://github.com/clerk/javascript/commit/460ba1cc82bbad6197224ca71ad39302564408b4))

## [2.14.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/types@2.13.0...@clerk/types@2.14.0-staging.0) (2022-05-17)

### Features

- **types:** Include new organization role `guest_member` ([ba7f27b](https://github.com/clerk/javascript/commit/ba7f27b42be283f9b7b4126cecc8d93ab9a6f04e))

### Bug Fixes

- **clerk-js:** Navigate to sign up continue in web3 ([460ba1c](https://github.com/clerk/javascript/commit/460ba1cc82bbad6197224ca71ad39302564408b4))

## [2.13.0](https://github.com/clerk/javascript/compare/@clerk/types@2.10.1...@clerk/types@2.13.0) (2022-05-13)

### Features

- **clerk-js:** Add shortcut to active org in Clerk singleton ([03e68d4](https://github.com/clerk/javascript/commit/03e68d4667e7abcd006c4a3a2a2fe7f65bfca417))
- **types:** Introduce Web3 provider types and helpers ([8291d75](https://github.com/clerk/javascript/commit/8291d75a7f3172d05f76c0f9aeb08aab98e7d81c))

## [2.12.0](https://github.com/clerk/javascript/compare/@clerk/types@2.10.1...@clerk/types@2.12.0) (2022-05-12)

### Features

- **types:** Introduce Web3 provider types and helpers ([8291d75](https://github.com/clerk/javascript/commit/8291d75a7f3172d05f76c0f9aeb08aab98e7d81c))

## [2.11.0](https://github.com/clerk/javascript/compare/@clerk/types@2.10.1...@clerk/types@2.11.0) (2022-05-12)

### Features

- **types:** Introduce Web3 provider types and helpers ([8291d75](https://github.com/clerk/javascript/commit/8291d75a7f3172d05f76c0f9aeb08aab98e7d81c))

### [2.10.1](https://github.com/clerk/javascript/compare/@clerk/types@2.10.1-staging.0...@clerk/types@2.10.1) (2022-05-11)

**Note:** Version bump only for package @clerk/types

## [2.10.0](https://github.com/clerk/javascript/compare/@clerk/types@2.9.0...@clerk/types@2.10.0) (2022-05-06)

### Features

- **nextjs,clerk-sdk-node,remix:** Add claims attribute to req.auth ([c695529](https://github.com/clerk/javascript/commit/c695529089f55baef72b86e3b73b8cd9f4f58e6d))

## [2.9.0](https://github.com/clerk/javascript/compare/@clerk/types@2.9.0-staging.0...@clerk/types@2.9.0) (2022-05-05)

**Note:** Version bump only for package @clerk/types

## [2.8.0](https://github.com/clerk/javascript/compare/@clerk/types@2.7.1...@clerk/types@2.8.0) (2022-04-28)

### Features

- **clerk-js:** Add members to organizations ([d6787b6](https://github.com/clerk/javascript/commit/d6787b659744ea2ca178d6cf7df488be265d7a69))
- **clerk-js:** Delete organizations ([7cb1bea](https://github.com/clerk/javascript/commit/7cb1beaf12b293b9fde541855eb2cda81e0d6be4))

### [2.7.1](https://github.com/clerk/javascript/compare/@clerk/types@2.7.1-staging.1...@clerk/types@2.7.1) (2022-04-19)

**Note:** Version bump only for package @clerk/types

### [2.7.1-staging.1](https://github.com/clerk/javascript/compare/@clerk/types@2.7.1-staging.0...@clerk/types@2.7.1-staging.1) (2022-04-19)

### Bug Fixes

- **clerk-js:** Pass rotating_token_nonce correctly to FAPIClient ([370cb0e](https://github.com/clerk/javascript/commit/370cb0e26bccd524c44b9e7fc0e15521193f514f))

## [2.7.0](https://github.com/clerk/javascript/compare/@clerk/types@2.6.1-alpha.0...@clerk/types@2.7.0) (2022-04-18)

### Features

- **clerk-js:** Organization slugs ([7f0e771](https://github.com/clerk/javascript/commit/7f0e771036815885b01da095979cf39da212503f))

### [2.6.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/types@2.6.0...@clerk/types@2.6.1-alpha.0) (2022-04-15)

**Note:** Version bump only for package @clerk/types

## [2.6.0](https://github.com/clerk/javascript/compare/@clerk/types@2.6.0-staging.0...@clerk/types@2.6.0) (2022-04-15)

**Note:** Version bump only for package @clerk/types

## [2.5.0](https://github.com/clerk/javascript/compare/@clerk/types@2.5.0-staging.0...@clerk/types@2.5.0) (2022-04-13)

**Note:** Version bump only for package @clerk/types

## [2.4.0](https://github.com/clerk/javascript/compare/@clerk/types@2.3.0...@clerk/types@2.4.0) (2022-04-07)

### Features

- **types:** Introduce global UserPublicMetadata and UserUnsafeMetadata interfaces ([b1220ae](https://github.com/clerk/javascript/commit/b1220ae83afac53edac5f09ce2c332f188952ed4))

## [2.3.0](https://github.com/clerk/javascript/compare/@clerk/types@2.3.0-staging.0...@clerk/types@2.3.0) (2022-04-04)

**Note:** Version bump only for package @clerk/types

### [2.2.1](https://github.com/clerk/javascript/compare/@clerk/types@2.2.1-staging.0...@clerk/types@2.2.1) (2022-03-28)

**Note:** Version bump only for package @clerk/types

## [2.2.0](https://github.com/clerk/javascript/compare/@clerk/types@2.2.0-alpha.0...@clerk/types@2.2.0) (2022-03-24)

**Note:** Version bump only for package @clerk/types

## [2.2.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/types@2.1.2-staging.0...@clerk/types@2.2.0-staging.0) (2022-03-24)

### Features

- **types,clerk-js,backend-core,clerk-react:** Replace thrown error with null return in getToken ([d972f93](https://github.com/clerk/javascript/commit/d972f93684a39abf3619c335cc012b61d5187100))

### [2.1.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/types@2.1.1-staging.0...@clerk/types@2.1.1-alpha.0) (2022-03-23)

**Note:** Version bump only for package @clerk/types

## [2.1.0-alpha.1](https://github.com/clerk/javascript/compare/@clerk/types@2.1.0-alpha.0...@clerk/types@2.1.0-alpha.1) (2022-03-23)

### Features

- **types,clerk-js:** Allow connecting external accounts from the user profile page ([180961b](https://github.com/clerk/javascript/commit/180961b61d5f6b75b5bc373f5d644cd0576831a8))

## [2.1.0-alpha.0](https://github.com/clerk/javascript/compare/@clerk/types@2.0.1-alpha.3...@clerk/types@2.1.0-alpha.0) (2022-03-23)

### Features

- **clerk-js,types:** Rename UserButton params to afterSignOutUrl, afterMultiSessionSingleSignOutUrl ([c4cb76a](https://github.com/clerk/javascript/commit/c4cb76a1133fd2308b217cacaffb086b175f6347))

### [2.0.1-alpha.3](https://github.com/clerk/javascript/compare/@clerk/types@2.0.1-alpha.2...@clerk/types@2.0.1-alpha.3) (2022-03-22)

### Bug Fixes

- **clerk-js:** Add createdUserId attribute to SignUp ([#132](https://github.com/clerk/javascript/issues/132)) ([b1884bd](https://github.com/clerk/javascript/commit/b1884bd950d9fcb27505269a09038dd571072a4e))

### [2.0.1-alpha.2](https://github.com/clerk/javascript/compare/@clerk/types@2.0.1-staging.0...@clerk/types@2.0.1-alpha.2) (2022-03-22)

### Bug Fixes

- **clerk-js:** Fix signIn.prepareFirstFactor params ([e435245](https://github.com/clerk/javascript/commit/e4352454028099f0973203aa79e548890c6327bd))
- **clerk-js:** Make getToken use /user endpoint for integration tokens ([b61213b](https://github.com/clerk/javascript/commit/b61213b4c94952e6f21dd8e036aa6815c5c38c06))

### [2.0.1-alpha.1](https://github.com/clerk/javascript/compare/@clerk/types@2.0.1-staging.0...@clerk/types@2.0.1-alpha.1) (2022-03-20)

### Bug Fixes

- **clerk-js:** Fix signIn.prepareFirstFactor params ([e435245](https://github.com/clerk/javascript/commit/e4352454028099f0973203aa79e548890c6327bd))
- **clerk-js:** Make getToken use /user endpoint for integration tokens ([b61213b](https://github.com/clerk/javascript/commit/b61213b4c94952e6f21dd8e036aa6815c5c38c06))

### [2.0.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/types@2.0.1-staging.0...@clerk/types@2.0.1-alpha.0) (2022-03-19)

### Bug Fixes

- **clerk-js:** Fix signIn.prepareFirstFactor params ([e435245](https://github.com/clerk/javascript/commit/e4352454028099f0973203aa79e548890c6327bd))
- **clerk-js:** Make getToken use /user endpoint for integration tokens ([b61213b](https://github.com/clerk/javascript/commit/b61213b4c94952e6f21dd8e036aa6815c5c38c06))

## [2.0.0-alpha.9](https://github.com/clerk/javascript/compare/@clerk/types@1.28.3...@clerk/types@2.0.0-alpha.9) (2022-03-11)

### Features

- **nextjs:** Move shared NextJS SSR types to types package ([78d8c7c](https://github.com/clerk/javascript/commit/78d8c7c3e84f3926127e48c655793a0fca3cdc2c))
- **types:** Support for oauth_apple ([57b675c](https://github.com/clerk/javascript/commit/57b675c762187d1f16cde6d2577bac71f7993438))

## [2.0.0-alpha.8](https://github.com/clerk/javascript/compare/@clerk/types@1.25.4...@clerk/types@2.0.0-alpha.8) (2022-02-28)

### Features

- **nextjs:** Move shared NextJS SSR types to types package ([78d8c7c](https://github.com/clerk/javascript/commit/78d8c7c3e84f3926127e48c655793a0fca3cdc2c))
- **types:** Add support for oauth_microsoft ([96c1cc6](https://github.com/clerk/javascript/commit/96c1cc6817b9bbc6917ea2773498299c1ff9b951))

## [2.0.0-alpha.7](https://github.com/clerk/javascript/compare/@clerk/types@1.25.4...@clerk/types@2.0.0-alpha.7) (2022-02-25)

### Features

- **nextjs:** Move shared NextJS SSR types to types package ([8b898a1](https://github.com/clerk/javascript/commit/8b898a1aa503889921180850292fbfa3c8133ef5))

## [2.0.0-alpha.6](https://github.com/clerk/javascript/compare/@clerk/types@1.25.1-staging.0...@clerk/types@2.0.0-alpha.6) (2022-02-18)

### Features

- **nextjs:** Move shared NextJS SSR types to types package ([757dc2e](https://github.com/clerk/javascript/commit/757dc2ef1acf32f31bdad8bcab076bb710723781))

### [1.29.2](https://github.com/clerk/javascript/compare/@clerk/types@1.29.2-staging.1...@clerk/types@1.29.2) (2022-03-17)

**Note:** Version bump only for package @clerk/types

### [1.29.2-staging.1](https://github.com/clerk/javascript/compare/@clerk/types@1.29.2-staging.0...@clerk/types@1.29.2-staging.1) (2022-03-17)

**Note:** Version bump only for package @clerk/types

## [1.29.0](https://github.com/clerk/javascript/compare/@clerk/types@1.28.3...@clerk/types@1.29.0) (2022-03-11)

### Features

- **types:** Support for oauth_apple ([57b675c](https://github.com/clerk/javascript/commit/57b675c762187d1f16cde6d2577bac71f7993438))

### [1.28.3](https://github.com/clerk/javascript/compare/@clerk/types@1.28.3-staging.0...@clerk/types@1.28.3) (2022-03-09)

**Note:** Version bump only for package @clerk/types

### [1.28.1](https://github.com/clerk/javascript/compare/@clerk/types@1.28.0...@clerk/types@1.28.1) (2022-03-04)

### Bug Fixes

- **clerk-react,clerk-js,types:** Crate of API feedback fixes ([721ce72](https://github.com/clerk/javascript/commit/721ce7228c37b012891b2bec8caf290239164d05))
- **types:** Add OrganizationMembership methods on types ([8bac04c](https://github.com/clerk/javascript/commit/8bac04c90ab79c6fb2e319f5c566f421e5984fa7))
- **types:** Change type import from dot ([a1cdb79](https://github.com/clerk/javascript/commit/a1cdb79f9abde74b92911394b50e7d75107a9cfd))

## [1.28.0](https://github.com/clerk/javascript/compare/@clerk/types@1.27.1...@clerk/types@1.28.0) (2022-03-04)

### Features

- **clerk-js,clerk-react:** GetOrganization/s hook methods, fetching mechanism alignment ([fc11087](https://github.com/clerk/javascript/commit/fc110874f9a3e056cd43c773c267409dd9b318d6))
- **clerk-js:** Add more attributes on organization models ([af010ba](https://github.com/clerk/javascript/commit/af010bac4b6e0519eff42d210049c7b3a6bda203))
- **clerk-js:** Add organization basic resources ([09f9012](https://github.com/clerk/javascript/commit/09f90126282f757cee6f97e7eae8747abc641bb0))
- **clerk-js:** Basic organization data shape tests ([0ca9a31](https://github.com/clerk/javascript/commit/0ca9a3114b34bfaa338e6e90f1b0d57e02b7dd58))
- **clerk-js:** Invitation flow draft ([d6faaab](https://github.com/clerk/javascript/commit/d6faaabb7efec09a699c7e83ba24fd4bad199d6b))
- **clerk-js:** Sign up next draft and fixes ([e2eef78](https://github.com/clerk/javascript/commit/e2eef782d644f7fd1925fee67ee81d27473255fc))
- **clerk-js:** SignUp with organization invitation flow draft ([2a9edbd](https://github.com/clerk/javascript/commit/2a9edbd52916f9bc037f266d1f96269cf54023cb))
- **clerk-react,clerk-js:** Add useOrganization hook using \_\_unstable attribute ([1635132](https://github.com/clerk/javascript/commit/16351321a99945d167cbf6e6ca0efdbbbf7efe5a))

### Bug Fixes

- **types:** Guarantee elements not in oauth sorting array will be sorted last ([f3c2869](https://github.com/clerk/javascript/commit/f3c2869bc244fc594522ef8f889055f82d31463f))

### [1.27.1](https://github.com/clerk/javascript/compare/@clerk/types@1.27.0...@clerk/types@1.27.1) (2022-03-03)

### Bug Fixes

- **types:** Consolidate oauth provider types ([bce9ef5](https://github.com/clerk/javascript/commit/bce9ef5cbfe02e11fe71db3e34dbf4fd9be9c3ed))

## [1.27.0](https://github.com/clerk/javascript/compare/@clerk/types@1.26.0...@clerk/types@1.27.0) (2022-03-02)

### Features

- **types,clerk-js:** Introduce Notion OAuth ([#72](https://github.com/clerk/javascript/issues/72)) ([9e556d0](https://github.com/clerk/javascript/commit/9e556d00fb41dedbbd05de59947d00c720bb3d95))

## [1.26.0](https://github.com/clerk/javascript/compare/@clerk/types@1.25.4...@clerk/types@1.26.0) (2022-03-01)

### Features

- **types:** Add support for oauth_microsoft ([96c1cc6](https://github.com/clerk/javascript/commit/96c1cc6817b9bbc6917ea2773498299c1ff9b951))

### [1.25.4](https://github.com/clerk/javascript/compare/@clerk/types@1.25.4-staging.0...@clerk/types@1.25.4) (2022-02-24)

**Note:** Version bump only for package @clerk/types

### [1.25.4-staging.0](https://github.com/clerk/javascript/compare/@clerk/types@1.25.3-staging.0...@clerk/types@1.25.4-staging.0) (2022-02-24)

### Features

- **clerk-js:** Introduce `UserSettings.instanceIsPasswordBased` ([f72a555](https://github.com/clerk/javascript/commit/f72a555f6adb38870539e9bab63cb638c04517d6))

### Bug Fixes

- **clerk-js,clerk-react:** Revert user settings work ([9a70576](https://github.com/clerk/javascript/commit/9a70576d1a47f01e6dbbfd8704f321daddcfe590))

### [1.25.3-staging.0](https://github.com/clerk/javascript/compare/@clerk/types@1.25.2-staging.0...@clerk/types@1.25.3-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/types

### [1.25.2-staging.0](https://github.com/clerk/javascript/compare/@clerk/types@1.25.1...@clerk/types@1.25.2-staging.0) (2022-02-15)

### Features

- **clerk-js:** Refactor signUp utils to work with userSettings ([0eb3352](https://github.com/clerk/javascript/commit/0eb3352cf93c35eb5de162822802124248cef840))
- **types:** Introduce 'UserSettingsResource' ([32fcf04](https://github.com/clerk/javascript/commit/32fcf0477e6db4851f4de50904c02868ba1790ee))

### [1.25.1](https://github.com/clerk/javascript/compare/@clerk/types@1.25.1-staging.0...@clerk/types@1.25.1) (2022-02-14)

**Note:** Version bump only for package @clerk/types

### 1.25.1-staging.0 (2022-02-11)

**Note:** Version bump only for package @clerk/types
