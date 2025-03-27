# @clerk/sdk-backend

Developer-friendly & type-safe Typescript SDK specifically catered to leverage _@clerk/sdk-backend_ API.

<div align="left">
    <a href="https://www.speakeasy.com/?utm_source=@clerk/sdk-backend&utm_campaign=typescript"><img src="https://custom-icon-badges.demolab.com/badge/-Built%20By%20Speakeasy-212015?style=for-the-badge&logoColor=FBE331&logo=speakeasy&labelColor=545454" /></a>
    <a href="https://opensource.org/licenses/MIT">
        <img src="https://img.shields.io/badge/License-MIT-blue.svg" style="width: 100px; height: 28px;" />
    </a>
</div>

<br /><br />

> [!IMPORTANT]
> This SDK is not yet ready for production use. To complete setup please follow the steps outlined in your [workspace](https://app.speakeasy.com/org/clerk/clerk). Delete this section before > publishing to a package manager.

<!-- Start Summary [summary] -->
## Summary

Clerk Backend API: The Clerk REST Backend API, meant to be accessed by backend servers.

### Versions

When the API changes in a way that isn't compatible with older versions, a new version is released.
Each version is identified by its release date, e.g. `2025-12-03`. For more information, please see [Clerk API Versions](https://clerk.com/docs/versioning/available-versions).

Please see https://clerk.com/docs for more information.

More information about the API can be found at https://clerk.com/docs
<!-- End Summary [summary] -->

<!-- Start Table of Contents [toc] -->
## Table of Contents
<!-- $toc-max-depth=2 -->
* [@clerk/sdk-backend](#clerksdk-backend)
  * [SDK Installation](#sdk-installation)
  * [Requirements](#requirements)
  * [SDK Example Usage](#sdk-example-usage)
  * [Authentication](#authentication)
  * [Available Resources and Operations](#available-resources-and-operations)
  * [Standalone functions](#standalone-functions)
  * [File uploads](#file-uploads)
  * [Retries](#retries)
  * [Error Handling](#error-handling)
  * [Server Selection](#server-selection)
  * [Custom HTTP Client](#custom-http-client)
  * [Debugging](#debugging)
* [Development](#development)
  * [Maturity](#maturity)
  * [Contributions](#contributions)

<!-- End Table of Contents [toc] -->

<!-- Start SDK Installation [installation] -->
## SDK Installation

> [!TIP]
> To finish publishing your SDK to npm and others you must [run your first generation action](https://www.speakeasy.com/docs/github-setup#step-by-step-guide).


The SDK can be installed with either [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [bun](https://bun.sh/) or [yarn](https://classic.yarnpkg.com/en/) package managers.

### NPM

```bash
npm add <UNSET>
```

### PNPM

```bash
pnpm add <UNSET>
```

### Bun

```bash
bun add <UNSET>
```

### Yarn

```bash
yarn add <UNSET> zod

# Note that Yarn does not install peer dependencies automatically. You will need
# to install zod as shown above.
```

> [!NOTE]
> This package is published with CommonJS and ES Modules (ESM) support.
<!-- End SDK Installation [installation] -->

<!-- Start Requirements [requirements] -->
## Requirements

For supported JavaScript runtimes, please consult [RUNTIMES.md](RUNTIMES.md).
<!-- End Requirements [requirements] -->

<!-- Start SDK Example Usage [usage] -->
## SDK Example Usage

### Example

```typescript
import { Clerk } from "@clerk/backend-sdk";

const clerk = new Clerk();

async function run() {
  await clerk.miscellaneous.getPublicInterstitial({});
}

run();

```
<!-- End SDK Example Usage [usage] -->

<!-- Start Authentication [security] -->
## Authentication

### Per-Client Security Schemes

This SDK supports the following security scheme globally:

| Name         | Type | Scheme      | Environment Variable |
| ------------ | ---- | ----------- | -------------------- |
| `bearerAuth` | http | HTTP Bearer | `CLERK_BEARER_AUTH`  |

To authenticate with the API the `bearerAuth` parameter must be set when initializing the SDK client instance. For example:
```typescript
import { Clerk } from "@clerk/backend-sdk";

const clerk = new Clerk({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  await clerk.miscellaneous.getPublicInterstitial({});
}

run();

```
<!-- End Authentication [security] -->

<!-- Start Available Resources and Operations [operations] -->
## Available Resources and Operations

<details open>
<summary>Available methods</summary>

### [actorTokens](docs/sdks/actortokens/README.md)

* [create](docs/sdks/actortokens/README.md#create) - Create actor token
* [revoke](docs/sdks/actortokens/README.md#revoke) - Revoke actor token

### [allowlistIdentifiers](docs/sdks/allowlistidentifiers/README.md)

* [list](docs/sdks/allowlistidentifiers/README.md#list) - List all identifiers on the allow-list
* [create](docs/sdks/allowlistidentifiers/README.md#create) - Add identifier to the allow-list
* [delete](docs/sdks/allowlistidentifiers/README.md#delete) - Delete identifier from allow-list

### [betaFeatures](docs/sdks/betafeatures/README.md)

* [updateInstanceSettings](docs/sdks/betafeatures/README.md#updateinstancesettings) - Update instance settings
* [~~updateProductionInstanceDomain~~](docs/sdks/betafeatures/README.md#updateproductioninstancedomain) - Update production instance domain :warning: **Deprecated**

### [blocklistIdentifiers](docs/sdks/blocklistidentifiers/README.md)

* [list](docs/sdks/blocklistidentifiers/README.md#list) - List all identifiers on the block-list
* [create](docs/sdks/blocklistidentifiers/README.md#create) - Add identifier to the block-list
* [delete](docs/sdks/blocklistidentifiers/README.md#delete) - Delete identifier from block-list


### [clients](docs/sdks/clients/README.md)

* [~~list~~](docs/sdks/clients/README.md#list) - List all clients :warning: **Deprecated**
* [verify](docs/sdks/clients/README.md#verify) - Verify a client
* [get](docs/sdks/clients/README.md#get) - Get a client

### [domains](docs/sdks/domains/README.md)

* [list](docs/sdks/domains/README.md#list) - List all instance domains
* [add](docs/sdks/domains/README.md#add) - Add a domain
* [delete](docs/sdks/domains/README.md#delete) - Delete a satellite domain
* [update](docs/sdks/domains/README.md#update) - Update a domain

### [emailAddresses](docs/sdks/emailaddresses/README.md)

* [create](docs/sdks/emailaddresses/README.md#create) - Create an email address
* [get](docs/sdks/emailaddresses/README.md#get) - Retrieve an email address
* [delete](docs/sdks/emailaddresses/README.md#delete) - Delete an email address
* [update](docs/sdks/emailaddresses/README.md#update) - Update an email address

### [~~emailAndSmsTemplates~~](docs/sdks/emailandsmstemplates/README.md)

* [~~upsert~~](docs/sdks/emailandsmstemplates/README.md#upsert) - Update a template for a given type and slug :warning: **Deprecated**

### [~~emailSMSTemplates~~](docs/sdks/emailsmstemplates/README.md)

* [~~list~~](docs/sdks/emailsmstemplates/README.md#list) - List all templates :warning: **Deprecated**
* [~~get~~](docs/sdks/emailsmstemplates/README.md#get) - Retrieve a template :warning: **Deprecated**
* [~~revert~~](docs/sdks/emailsmstemplates/README.md#revert) - Revert a template :warning: **Deprecated**
* [~~toggleTemplateDelivery~~](docs/sdks/emailsmstemplates/README.md#toggletemplatedelivery) - Toggle the delivery by Clerk for a template of a given type and slug :warning: **Deprecated**

### [instanceSettings](docs/sdks/instancesettings/README.md)

* [get](docs/sdks/instancesettings/README.md#get) - Fetch the current instance
* [update](docs/sdks/instancesettings/README.md#update) - Update instance settings
* [updateRestrictions](docs/sdks/instancesettings/README.md#updaterestrictions) - Update instance restrictions
* [changeDomain](docs/sdks/instancesettings/README.md#changedomain) - Update production instance domain
* [updateOrganizationSettings](docs/sdks/instancesettings/README.md#updateorganizationsettings) - Update instance organization settings

### [invitations](docs/sdks/invitations/README.md)

* [create](docs/sdks/invitations/README.md#create) - Create an invitation
* [list](docs/sdks/invitations/README.md#list) - List all invitations
* [bulkCreate](docs/sdks/invitations/README.md#bulkcreate) - Create multiple invitations
* [revoke](docs/sdks/invitations/README.md#revoke) - Revokes an invitation

### [jwks](docs/sdks/jwks/README.md)

* [getJWKS](docs/sdks/jwks/README.md#getjwks) - Retrieve the JSON Web Key Set of the instance

### [jwtTemplates](docs/sdks/jwttemplates/README.md)

* [list](docs/sdks/jwttemplates/README.md#list) - List all templates
* [create](docs/sdks/jwttemplates/README.md#create) - Create a JWT template
* [get](docs/sdks/jwttemplates/README.md#get) - Retrieve a template
* [update](docs/sdks/jwttemplates/README.md#update) - Update a JWT template
* [delete](docs/sdks/jwttemplates/README.md#delete) - Delete a Template

### [miscellaneous](docs/sdks/miscellaneous/README.md)

* [getPublicInterstitial](docs/sdks/miscellaneous/README.md#getpublicinterstitial) - Returns the markup for the interstitial page

### [oauthApplications](docs/sdks/oauthapplications/README.md)

* [list](docs/sdks/oauthapplications/README.md#list) - Get a list of OAuth applications for an instance
* [create](docs/sdks/oauthapplications/README.md#create) - Create an OAuth application
* [get](docs/sdks/oauthapplications/README.md#get) - Retrieve an OAuth application by ID
* [update](docs/sdks/oauthapplications/README.md#update) - Update an OAuth application
* [delete](docs/sdks/oauthapplications/README.md#delete) - Delete an OAuth application
* [rotateSecret](docs/sdks/oauthapplications/README.md#rotatesecret) - Rotate the client secret of the given OAuth application

### [organizationDomains](docs/sdks/organizationdomains/README.md)

* [create](docs/sdks/organizationdomains/README.md#create) - Create a new organization domain.
* [list](docs/sdks/organizationdomains/README.md#list) - Get a list of all domains of an organization.
* [update](docs/sdks/organizationdomains/README.md#update) - Update an organization domain.
* [delete](docs/sdks/organizationdomains/README.md#delete) - Remove a domain from an organization.

### [organizationInvitations](docs/sdks/organizationinvitations/README.md)

* [getAll](docs/sdks/organizationinvitations/README.md#getall) - Get a list of organization invitations for the current instance
* [create](docs/sdks/organizationinvitations/README.md#create) - Create and send an organization invitation
* [list](docs/sdks/organizationinvitations/README.md#list) - Get a list of organization invitations
* [bulkCreate](docs/sdks/organizationinvitations/README.md#bulkcreate) - Bulk create and send organization invitations
* [~~listPending~~](docs/sdks/organizationinvitations/README.md#listpending) - Get a list of pending organization invitations :warning: **Deprecated**
* [get](docs/sdks/organizationinvitations/README.md#get) - Retrieve an organization invitation by ID
* [revoke](docs/sdks/organizationinvitations/README.md#revoke) - Revoke a pending organization invitation

### [organizationMemberships](docs/sdks/organizationmemberships/README.md)

* [create](docs/sdks/organizationmemberships/README.md#create) - Create a new organization membership
* [list](docs/sdks/organizationmemberships/README.md#list) - Get a list of all members of an organization
* [update](docs/sdks/organizationmemberships/README.md#update) - Update an organization membership
* [delete](docs/sdks/organizationmemberships/README.md#delete) - Remove a member from an organization
* [updateMetadata](docs/sdks/organizationmemberships/README.md#updatemetadata) - Merge and update organization membership metadata

### [organizations](docs/sdks/organizations/README.md)

* [list](docs/sdks/organizations/README.md#list) - Get a list of organizations for an instance
* [create](docs/sdks/organizations/README.md#create) - Create an organization
* [get](docs/sdks/organizations/README.md#get) - Retrieve an organization by ID or slug
* [update](docs/sdks/organizations/README.md#update) - Update an organization
* [delete](docs/sdks/organizations/README.md#delete) - Delete an organization
* [mergeMetadata](docs/sdks/organizations/README.md#mergemetadata) - Merge and update metadata for an organization
* [uploadLogo](docs/sdks/organizations/README.md#uploadlogo) - Upload a logo for the organization
* [deleteLogo](docs/sdks/organizations/README.md#deletelogo) - Delete the organization's logo.

### [phoneNumbers](docs/sdks/phonenumbers/README.md)

* [create](docs/sdks/phonenumbers/README.md#create) - Create a phone number
* [get](docs/sdks/phonenumbers/README.md#get) - Retrieve a phone number
* [delete](docs/sdks/phonenumbers/README.md#delete) - Delete a phone number
* [update](docs/sdks/phonenumbers/README.md#update) - Update a phone number

### [proxyChecks](docs/sdks/proxychecks/README.md)

* [verify](docs/sdks/proxychecks/README.md#verify) - Verify the proxy configuration for your domain

### [redirectUrls](docs/sdks/redirecturls/README.md)

* [list](docs/sdks/redirecturls/README.md#list) - List all redirect URLs
* [create](docs/sdks/redirecturls/README.md#create) - Create a redirect URL
* [get](docs/sdks/redirecturls/README.md#get) - Retrieve a redirect URL
* [delete](docs/sdks/redirecturls/README.md#delete) - Delete a redirect URL

### [samlConnections](docs/sdks/samlconnections/README.md)

* [list](docs/sdks/samlconnections/README.md#list) - Get a list of SAML Connections for an instance
* [create](docs/sdks/samlconnections/README.md#create) - Create a SAML Connection
* [get](docs/sdks/samlconnections/README.md#get) - Retrieve a SAML Connection by ID
* [update](docs/sdks/samlconnections/README.md#update) - Update a SAML Connection
* [delete](docs/sdks/samlconnections/README.md#delete) - Delete a SAML Connection

### [sessions](docs/sdks/sessions/README.md)

* [list](docs/sdks/sessions/README.md#list) - List all sessions
* [create](docs/sdks/sessions/README.md#create) - Create a new active session
* [get](docs/sdks/sessions/README.md#get) - Retrieve a session
* [refresh](docs/sdks/sessions/README.md#refresh) - Refresh a session
* [revoke](docs/sdks/sessions/README.md#revoke) - Revoke a session
* [~~verify~~](docs/sdks/sessions/README.md#verify) - Verify a session :warning: **Deprecated**
* [createToken](docs/sdks/sessions/README.md#createtoken) - Create a session token
* [createTokenFromTemplate](docs/sdks/sessions/README.md#createtokenfromtemplate) - Create a session token from a jwt template

### [signInTokens](docs/sdks/signintokens/README.md)

* [create](docs/sdks/signintokens/README.md#create) - Create sign-in token
* [revoke](docs/sdks/signintokens/README.md#revoke) - Revoke the given sign-in token

### [signUps](docs/sdks/signups/README.md)

* [get](docs/sdks/signups/README.md#get) - Retrieve a sign-up by ID
* [update](docs/sdks/signups/README.md#update) - Update a sign-up

### [~~templates~~](docs/sdks/templates/README.md)

* [~~preview~~](docs/sdks/templates/README.md#preview) - Preview changes to a template :warning: **Deprecated**

### [testingTokens](docs/sdks/testingtokens/README.md)

* [create](docs/sdks/testingtokens/README.md#create) - Retrieve a new testing token

### [users](docs/sdks/users/README.md)

* [list](docs/sdks/users/README.md#list) - List all users
* [create](docs/sdks/users/README.md#create) - Create a new user
* [count](docs/sdks/users/README.md#count) - Count users
* [get](docs/sdks/users/README.md#get) - Retrieve a user
* [update](docs/sdks/users/README.md#update) - Update a user
* [delete](docs/sdks/users/README.md#delete) - Delete a user
* [ban](docs/sdks/users/README.md#ban) - Ban a user
* [unban](docs/sdks/users/README.md#unban) - Unban a user
* [lock](docs/sdks/users/README.md#lock) - Lock a user
* [unlock](docs/sdks/users/README.md#unlock) - Unlock a user
* [setProfileImage](docs/sdks/users/README.md#setprofileimage) - Set user profile image
* [deleteProfileImage](docs/sdks/users/README.md#deleteprofileimage) - Delete user profile image
* [updateMetadata](docs/sdks/users/README.md#updatemetadata) - Merge and update a user's metadata
* [getOAuthAccessToken](docs/sdks/users/README.md#getoauthaccesstoken) - Retrieve the OAuth access token of a user
* [getOrganizationMemberships](docs/sdks/users/README.md#getorganizationmemberships) - Retrieve all memberships for a user
* [getOrganizationInvitations](docs/sdks/users/README.md#getorganizationinvitations) - Retrieve all invitations for a user
* [verifyPassword](docs/sdks/users/README.md#verifypassword) - Verify the password of a user
* [verifyTotp](docs/sdks/users/README.md#verifytotp) - Verify a TOTP or backup code for a user
* [disableMfa](docs/sdks/users/README.md#disablemfa) - Disable a user's MFA methods
* [deleteBackupCodes](docs/sdks/users/README.md#deletebackupcodes) - Disable all user's Backup codes
* [deletePasskey](docs/sdks/users/README.md#deletepasskey) - Delete a user passkey
* [deleteWeb3Wallet](docs/sdks/users/README.md#deleteweb3wallet) - Delete a user web3 wallet
* [deleteTOTP](docs/sdks/users/README.md#deletetotp) - Delete all the user's TOTPs
* [deleteExternalAccount](docs/sdks/users/README.md#deleteexternalaccount) - Delete External Account
* [getInstanceOrganizationMemberships](docs/sdks/users/README.md#getinstanceorganizationmemberships) - Get a list of all organization memberships within an instance.

### [waitlistEntries](docs/sdks/waitlistentries/README.md)

* [list](docs/sdks/waitlistentries/README.md#list) - List all waitlist entries
* [create](docs/sdks/waitlistentries/README.md#create) - Create a waitlist entry

### [webhooks](docs/sdks/webhooks/README.md)

* [createSvixApp](docs/sdks/webhooks/README.md#createsvixapp) - Create a Svix app
* [deleteSvixApp](docs/sdks/webhooks/README.md#deletesvixapp) - Delete a Svix app
* [generateSvixAuthURL](docs/sdks/webhooks/README.md#generatesvixauthurl) - Create a Svix Dashboard URL

</details>
<!-- End Available Resources and Operations [operations] -->

<!-- Start Standalone functions [standalone-funcs] -->
## Standalone functions

All the methods listed above are available as standalone functions. These
functions are ideal for use in applications running in the browser, serverless
runtimes or other environments where application bundle size is a primary
concern. When using a bundler to build your application, all unused
functionality will be either excluded from the final bundle or tree-shaken away.

To read more about standalone functions, check [FUNCTIONS.md](./FUNCTIONS.md).

<details>

<summary>Available standalone functions</summary>

- [`actorTokensCreate`](docs/sdks/actortokens/README.md#create) - Create actor token
- [`actorTokensRevoke`](docs/sdks/actortokens/README.md#revoke) - Revoke actor token
- [`allowlistIdentifiersCreate`](docs/sdks/allowlistidentifiers/README.md#create) - Add identifier to the allow-list
- [`allowlistIdentifiersDelete`](docs/sdks/allowlistidentifiers/README.md#delete) - Delete identifier from allow-list
- [`allowlistIdentifiersList`](docs/sdks/allowlistidentifiers/README.md#list) - List all identifiers on the allow-list
- [`betaFeaturesUpdateInstanceSettings`](docs/sdks/betafeatures/README.md#updateinstancesettings) - Update instance settings
- [`blocklistIdentifiersCreate`](docs/sdks/blocklistidentifiers/README.md#create) - Add identifier to the block-list
- [`blocklistIdentifiersDelete`](docs/sdks/blocklistidentifiers/README.md#delete) - Delete identifier from block-list
- [`blocklistIdentifiersList`](docs/sdks/blocklistidentifiers/README.md#list) - List all identifiers on the block-list
- [`clientsGet`](docs/sdks/clients/README.md#get) - Get a client
- [`clientsVerify`](docs/sdks/clients/README.md#verify) - Verify a client
- [`domainsAdd`](docs/sdks/domains/README.md#add) - Add a domain
- [`domainsDelete`](docs/sdks/domains/README.md#delete) - Delete a satellite domain
- [`domainsList`](docs/sdks/domains/README.md#list) - List all instance domains
- [`domainsUpdate`](docs/sdks/domains/README.md#update) - Update a domain
- [`emailAddressesCreate`](docs/sdks/emailaddresses/README.md#create) - Create an email address
- [`emailAddressesDelete`](docs/sdks/emailaddresses/README.md#delete) - Delete an email address
- [`emailAddressesGet`](docs/sdks/emailaddresses/README.md#get) - Retrieve an email address
- [`emailAddressesUpdate`](docs/sdks/emailaddresses/README.md#update) - Update an email address
- [`instanceSettingsChangeDomain`](docs/sdks/instancesettings/README.md#changedomain) - Update production instance domain
- [`instanceSettingsGet`](docs/sdks/instancesettings/README.md#get) - Fetch the current instance
- [`instanceSettingsUpdate`](docs/sdks/instancesettings/README.md#update) - Update instance settings
- [`instanceSettingsUpdateOrganizationSettings`](docs/sdks/instancesettings/README.md#updateorganizationsettings) - Update instance organization settings
- [`instanceSettingsUpdateRestrictions`](docs/sdks/instancesettings/README.md#updaterestrictions) - Update instance restrictions
- [`invitationsBulkCreate`](docs/sdks/invitations/README.md#bulkcreate) - Create multiple invitations
- [`invitationsCreate`](docs/sdks/invitations/README.md#create) - Create an invitation
- [`invitationsList`](docs/sdks/invitations/README.md#list) - List all invitations
- [`invitationsRevoke`](docs/sdks/invitations/README.md#revoke) - Revokes an invitation
- [`jwksGetJWKS`](docs/sdks/jwks/README.md#getjwks) - Retrieve the JSON Web Key Set of the instance
- [`jwtTemplatesCreate`](docs/sdks/jwttemplates/README.md#create) - Create a JWT template
- [`jwtTemplatesDelete`](docs/sdks/jwttemplates/README.md#delete) - Delete a Template
- [`jwtTemplatesGet`](docs/sdks/jwttemplates/README.md#get) - Retrieve a template
- [`jwtTemplatesList`](docs/sdks/jwttemplates/README.md#list) - List all templates
- [`jwtTemplatesUpdate`](docs/sdks/jwttemplates/README.md#update) - Update a JWT template
- [`miscellaneousGetPublicInterstitial`](docs/sdks/miscellaneous/README.md#getpublicinterstitial) - Returns the markup for the interstitial page
- [`oauthApplicationsCreate`](docs/sdks/oauthapplications/README.md#create) - Create an OAuth application
- [`oauthApplicationsDelete`](docs/sdks/oauthapplications/README.md#delete) - Delete an OAuth application
- [`oauthApplicationsGet`](docs/sdks/oauthapplications/README.md#get) - Retrieve an OAuth application by ID
- [`oauthApplicationsList`](docs/sdks/oauthapplications/README.md#list) - Get a list of OAuth applications for an instance
- [`oauthApplicationsRotateSecret`](docs/sdks/oauthapplications/README.md#rotatesecret) - Rotate the client secret of the given OAuth application
- [`oauthApplicationsUpdate`](docs/sdks/oauthapplications/README.md#update) - Update an OAuth application
- [`organizationDomainsCreate`](docs/sdks/organizationdomains/README.md#create) - Create a new organization domain.
- [`organizationDomainsDelete`](docs/sdks/organizationdomains/README.md#delete) - Remove a domain from an organization.
- [`organizationDomainsList`](docs/sdks/organizationdomains/README.md#list) - Get a list of all domains of an organization.
- [`organizationDomainsUpdate`](docs/sdks/organizationdomains/README.md#update) - Update an organization domain.
- [`organizationInvitationsBulkCreate`](docs/sdks/organizationinvitations/README.md#bulkcreate) - Bulk create and send organization invitations
- [`organizationInvitationsCreate`](docs/sdks/organizationinvitations/README.md#create) - Create and send an organization invitation
- [`organizationInvitationsGet`](docs/sdks/organizationinvitations/README.md#get) - Retrieve an organization invitation by ID
- [`organizationInvitationsGetAll`](docs/sdks/organizationinvitations/README.md#getall) - Get a list of organization invitations for the current instance
- [`organizationInvitationsList`](docs/sdks/organizationinvitations/README.md#list) - Get a list of organization invitations
- [`organizationInvitationsRevoke`](docs/sdks/organizationinvitations/README.md#revoke) - Revoke a pending organization invitation
- [`organizationMembershipsCreate`](docs/sdks/organizationmemberships/README.md#create) - Create a new organization membership
- [`organizationMembershipsDelete`](docs/sdks/organizationmemberships/README.md#delete) - Remove a member from an organization
- [`organizationMembershipsList`](docs/sdks/organizationmemberships/README.md#list) - Get a list of all members of an organization
- [`organizationMembershipsUpdate`](docs/sdks/organizationmemberships/README.md#update) - Update an organization membership
- [`organizationMembershipsUpdateMetadata`](docs/sdks/organizationmemberships/README.md#updatemetadata) - Merge and update organization membership metadata
- [`organizationsCreate`](docs/sdks/organizations/README.md#create) - Create an organization
- [`organizationsDelete`](docs/sdks/organizations/README.md#delete) - Delete an organization
- [`organizationsDeleteLogo`](docs/sdks/organizations/README.md#deletelogo) - Delete the organization's logo.
- [`organizationsGet`](docs/sdks/organizations/README.md#get) - Retrieve an organization by ID or slug
- [`organizationsList`](docs/sdks/organizations/README.md#list) - Get a list of organizations for an instance
- [`organizationsMergeMetadata`](docs/sdks/organizations/README.md#mergemetadata) - Merge and update metadata for an organization
- [`organizationsUpdate`](docs/sdks/organizations/README.md#update) - Update an organization
- [`organizationsUploadLogo`](docs/sdks/organizations/README.md#uploadlogo) - Upload a logo for the organization
- [`phoneNumbersCreate`](docs/sdks/phonenumbers/README.md#create) - Create a phone number
- [`phoneNumbersDelete`](docs/sdks/phonenumbers/README.md#delete) - Delete a phone number
- [`phoneNumbersGet`](docs/sdks/phonenumbers/README.md#get) - Retrieve a phone number
- [`phoneNumbersUpdate`](docs/sdks/phonenumbers/README.md#update) - Update a phone number
- [`proxyChecksVerify`](docs/sdks/proxychecks/README.md#verify) - Verify the proxy configuration for your domain
- [`redirectUrlsCreate`](docs/sdks/redirecturls/README.md#create) - Create a redirect URL
- [`redirectUrlsDelete`](docs/sdks/redirecturls/README.md#delete) - Delete a redirect URL
- [`redirectUrlsGet`](docs/sdks/redirecturls/README.md#get) - Retrieve a redirect URL
- [`redirectUrlsList`](docs/sdks/redirecturls/README.md#list) - List all redirect URLs
- [`samlConnectionsCreate`](docs/sdks/samlconnections/README.md#create) - Create a SAML Connection
- [`samlConnectionsDelete`](docs/sdks/samlconnections/README.md#delete) - Delete a SAML Connection
- [`samlConnectionsGet`](docs/sdks/samlconnections/README.md#get) - Retrieve a SAML Connection by ID
- [`samlConnectionsList`](docs/sdks/samlconnections/README.md#list) - Get a list of SAML Connections for an instance
- [`samlConnectionsUpdate`](docs/sdks/samlconnections/README.md#update) - Update a SAML Connection
- [`sessionsCreate`](docs/sdks/sessions/README.md#create) - Create a new active session
- [`sessionsCreateToken`](docs/sdks/sessions/README.md#createtoken) - Create a session token
- [`sessionsCreateTokenFromTemplate`](docs/sdks/sessions/README.md#createtokenfromtemplate) - Create a session token from a jwt template
- [`sessionsGet`](docs/sdks/sessions/README.md#get) - Retrieve a session
- [`sessionsList`](docs/sdks/sessions/README.md#list) - List all sessions
- [`sessionsRefresh`](docs/sdks/sessions/README.md#refresh) - Refresh a session
- [`sessionsRevoke`](docs/sdks/sessions/README.md#revoke) - Revoke a session
- [`signInTokensCreate`](docs/sdks/signintokens/README.md#create) - Create sign-in token
- [`signInTokensRevoke`](docs/sdks/signintokens/README.md#revoke) - Revoke the given sign-in token
- [`signUpsGet`](docs/sdks/signups/README.md#get) - Retrieve a sign-up by ID
- [`signUpsUpdate`](docs/sdks/signups/README.md#update) - Update a sign-up
- [`testingTokensCreate`](docs/sdks/testingtokens/README.md#create) - Retrieve a new testing token
- [`usersBan`](docs/sdks/users/README.md#ban) - Ban a user
- [`usersCount`](docs/sdks/users/README.md#count) - Count users
- [`usersCreate`](docs/sdks/users/README.md#create) - Create a new user
- [`usersDelete`](docs/sdks/users/README.md#delete) - Delete a user
- [`usersDeleteBackupCodes`](docs/sdks/users/README.md#deletebackupcodes) - Disable all user's Backup codes
- [`usersDeleteExternalAccount`](docs/sdks/users/README.md#deleteexternalaccount) - Delete External Account
- [`usersDeletePasskey`](docs/sdks/users/README.md#deletepasskey) - Delete a user passkey
- [`usersDeleteProfileImage`](docs/sdks/users/README.md#deleteprofileimage) - Delete user profile image
- [`usersDeleteTOTP`](docs/sdks/users/README.md#deletetotp) - Delete all the user's TOTPs
- [`usersDeleteWeb3Wallet`](docs/sdks/users/README.md#deleteweb3wallet) - Delete a user web3 wallet
- [`usersDisableMfa`](docs/sdks/users/README.md#disablemfa) - Disable a user's MFA methods
- [`usersGet`](docs/sdks/users/README.md#get) - Retrieve a user
- [`usersGetInstanceOrganizationMemberships`](docs/sdks/users/README.md#getinstanceorganizationmemberships) - Get a list of all organization memberships within an instance.
- [`usersGetOAuthAccessToken`](docs/sdks/users/README.md#getoauthaccesstoken) - Retrieve the OAuth access token of a user
- [`usersGetOrganizationInvitations`](docs/sdks/users/README.md#getorganizationinvitations) - Retrieve all invitations for a user
- [`usersGetOrganizationMemberships`](docs/sdks/users/README.md#getorganizationmemberships) - Retrieve all memberships for a user
- [`usersList`](docs/sdks/users/README.md#list) - List all users
- [`usersLock`](docs/sdks/users/README.md#lock) - Lock a user
- [`usersSetProfileImage`](docs/sdks/users/README.md#setprofileimage) - Set user profile image
- [`usersUnban`](docs/sdks/users/README.md#unban) - Unban a user
- [`usersUnlock`](docs/sdks/users/README.md#unlock) - Unlock a user
- [`usersUpdate`](docs/sdks/users/README.md#update) - Update a user
- [`usersUpdateMetadata`](docs/sdks/users/README.md#updatemetadata) - Merge and update a user's metadata
- [`usersVerifyPassword`](docs/sdks/users/README.md#verifypassword) - Verify the password of a user
- [`usersVerifyTotp`](docs/sdks/users/README.md#verifytotp) - Verify a TOTP or backup code for a user
- [`waitlistEntriesCreate`](docs/sdks/waitlistentries/README.md#create) - Create a waitlist entry
- [`waitlistEntriesList`](docs/sdks/waitlistentries/README.md#list) - List all waitlist entries
- [`webhooksCreateSvixApp`](docs/sdks/webhooks/README.md#createsvixapp) - Create a Svix app
- [`webhooksDeleteSvixApp`](docs/sdks/webhooks/README.md#deletesvixapp) - Delete a Svix app
- [`webhooksGenerateSvixAuthURL`](docs/sdks/webhooks/README.md#generatesvixauthurl) - Create a Svix Dashboard URL
- ~~[`betaFeaturesUpdateProductionInstanceDomain`](docs/sdks/betafeatures/README.md#updateproductioninstancedomain)~~ - Update production instance domain :warning: **Deprecated**
- ~~[`clientsList`](docs/sdks/clients/README.md#list)~~ - List all clients :warning: **Deprecated**
- ~~[`emailAndSmsTemplatesUpsert`](docs/sdks/emailandsmstemplates/README.md#upsert)~~ - Update a template for a given type and slug :warning: **Deprecated**
- ~~[`emailSMSTemplatesGet`](docs/sdks/emailsmstemplates/README.md#get)~~ - Retrieve a template :warning: **Deprecated**
- ~~[`emailSMSTemplatesList`](docs/sdks/emailsmstemplates/README.md#list)~~ - List all templates :warning: **Deprecated**
- ~~[`emailSMSTemplatesRevert`](docs/sdks/emailsmstemplates/README.md#revert)~~ - Revert a template :warning: **Deprecated**
- ~~[`emailSMSTemplatesToggleTemplateDelivery`](docs/sdks/emailsmstemplates/README.md#toggletemplatedelivery)~~ - Toggle the delivery by Clerk for a template of a given type and slug :warning: **Deprecated**
- ~~[`organizationInvitationsListPending`](docs/sdks/organizationinvitations/README.md#listpending)~~ - Get a list of pending organization invitations :warning: **Deprecated**
- ~~[`sessionsVerify`](docs/sdks/sessions/README.md#verify)~~ - Verify a session :warning: **Deprecated**
- ~~[`templatesPreview`](docs/sdks/templates/README.md#preview)~~ - Preview changes to a template :warning: **Deprecated**

</details>
<!-- End Standalone functions [standalone-funcs] -->

<!-- Start File uploads [file-upload] -->
## File uploads

Certain SDK methods accept files as part of a multi-part request. It is possible and typically recommended to upload files as a stream rather than reading the entire contents into memory. This avoids excessive memory consumption and potentially crashing with out-of-memory errors when working with very large files. The following example demonstrates how to attach a file stream to a request.

> [!TIP]
>
> Depending on your JavaScript runtime, there are convenient utilities that return a handle to a file without reading the entire contents into memory:
>
> - **Node.js v20+:** Since v20, Node.js comes with a native `openAsBlob` function in [`node:fs`](https://nodejs.org/docs/latest-v20.x/api/fs.html#fsopenasblobpath-options).
> - **Bun:** The native [`Bun.file`](https://bun.sh/docs/api/file-io#reading-files-bun-file) function produces a file handle that can be used for streaming file uploads.
> - **Browsers:** All supported browsers return an instance to a [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) when reading the value from an `<input type="file">` element.
> - **Node.js v18:** A file stream can be created using the `fileFrom` helper from [`fetch-blob/from.js`](https://www.npmjs.com/package/fetch-blob).

```typescript
import { Clerk } from "@clerk/backend-sdk";

const clerk = new Clerk({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const result = await clerk.users.setProfileImage({
    userId: "<id>",
    requestBody: {},
  });

  // Handle the result
  console.log(result);
}

run();

```
<!-- End File uploads [file-upload] -->

<!-- Start Retries [retries] -->
## Retries

Some of the endpoints in this SDK support retries.  If you use the SDK without any configuration, it will fall back to the default retry strategy provided by the API.  However, the default retry strategy can be overridden on a per-operation basis, or across the entire SDK.

To change the default retry strategy for a single API call, simply provide a retryConfig object to the call:
```typescript
import { Clerk } from "@clerk/backend-sdk";

const clerk = new Clerk();

async function run() {
  await clerk.miscellaneous.getPublicInterstitial({}, {
    retries: {
      strategy: "backoff",
      backoff: {
        initialInterval: 1,
        maxInterval: 50,
        exponent: 1.1,
        maxElapsedTime: 100,
      },
      retryConnectionErrors: false,
    },
  });
}

run();

```

If you'd like to override the default retry strategy for all operations that support retries, you can provide a retryConfig at SDK initialization:
```typescript
import { Clerk } from "@clerk/backend-sdk";

const clerk = new Clerk({
  retryConfig: {
    strategy: "backoff",
    backoff: {
      initialInterval: 1,
      maxInterval: 50,
      exponent: 1.1,
      maxElapsedTime: 100,
    },
    retryConnectionErrors: false,
  },
});

async function run() {
  await clerk.miscellaneous.getPublicInterstitial({});
}

run();

```
<!-- End Retries [retries] -->

<!-- Start Error Handling [errors] -->
## Error Handling

Some methods specify known errors which can be thrown. All the known errors are enumerated in the `models/errors/errors.ts` module. The known errors for a method are documented under the *Errors* tables in SDK docs. For example, the `verify` method may throw the following errors:

| Error Type         | Status Code   | Content Type     |
| ------------------ | ------------- | ---------------- |
| errors.ClerkErrors | 400, 401, 404 | application/json |
| errors.APIError    | 4XX, 5XX      | \*/\*            |

If the method throws an error and it is not captured by the known errors, it will default to throwing a `APIError`.

```typescript
import { Clerk } from "@clerk/backend-sdk";
import {
  ClerkErrors,
  SDKValidationError,
} from "@clerk/backend-sdk/models/errors";

const clerk = new Clerk({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  let result;
  try {
    result = await clerk.clients.verify();

    // Handle the result
    console.log(result);
  } catch (err) {
    switch (true) {
      // The server response does not match the expected SDK schema
      case (err instanceof SDKValidationError): {
        // Pretty-print will provide a human-readable multi-line error message
        console.error(err.pretty());
        // Raw value may also be inspected
        console.error(err.rawValue);
        return;
      }
      case (err instanceof ClerkErrors): {
        // Handle err.data$: ClerkErrorsData
        console.error(err);
        return;
      }
      default: {
        // Other errors such as network errors, see HTTPClientErrors for more details
        throw err;
      }
    }
  }
}

run();

```

Validation errors can also occur when either method arguments or data returned from the server do not match the expected format. The `SDKValidationError` that is thrown as a result will capture the raw value that failed validation in an attribute called `rawValue`. Additionally, a `pretty()` method is available on this error that can be used to log a nicely formatted multi-line string since validation errors can list many issues and the plain error string may be difficult read when debugging.

In some rare cases, the SDK can fail to get a response from the server or even make the request due to unexpected circumstances such as network conditions. These types of errors are captured in the `models/errors/httpclienterrors.ts` module:

| HTTP Client Error                                    | Description                                          |
| ---------------------------------------------------- | ---------------------------------------------------- |
| RequestAbortedError                                  | HTTP request was aborted by the client               |
| RequestTimeoutError                                  | HTTP request timed out due to an AbortSignal signal  |
| ConnectionError                                      | HTTP client was unable to make a request to a server |
| InvalidRequestError                                  | Any input used to create a request is invalid        |
| UnexpectedClientError                                | Unrecognised or unexpected error                     |
<!-- End Error Handling [errors] -->

<!-- Start Server Selection [server] -->
## Server Selection

### Override Server URL Per-Client

The default server can be overridden globally by passing a URL to the `serverURL: string` optional parameter when initializing the SDK client instance. For example:
```typescript
import { Clerk } from "@clerk/backend-sdk";

const clerk = new Clerk({
  serverURL: "https://api.clerk.com/v1",
});

async function run() {
  await clerk.miscellaneous.getPublicInterstitial({});
}

run();

```
<!-- End Server Selection [server] -->

<!-- Start Custom HTTP Client [http-client] -->
## Custom HTTP Client

The TypeScript SDK makes API calls using an `HTTPClient` that wraps the native
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). This
client is a thin wrapper around `fetch` and provides the ability to attach hooks
around the request lifecycle that can be used to modify the request or handle
errors and response.

The `HTTPClient` constructor takes an optional `fetcher` argument that can be
used to integrate a third-party HTTP client or when writing tests to mock out
the HTTP client and feed in fixtures.

The following example shows how to use the `"beforeRequest"` hook to to add a
custom header and a timeout to requests and how to use the `"requestError"` hook
to log errors:

```typescript
import { Clerk } from "@clerk/backend-sdk";
import { HTTPClient } from "@clerk/backend-sdk/lib/http";

const httpClient = new HTTPClient({
  // fetcher takes a function that has the same signature as native `fetch`.
  fetcher: (request) => {
    return fetch(request);
  }
});

httpClient.addHook("beforeRequest", (request) => {
  const nextRequest = new Request(request, {
    signal: request.signal || AbortSignal.timeout(5000)
  });

  nextRequest.headers.set("x-custom-header", "custom value");

  return nextRequest;
});

httpClient.addHook("requestError", (error, request) => {
  console.group("Request Error");
  console.log("Reason:", `${error}`);
  console.log("Endpoint:", `${request.method} ${request.url}`);
  console.groupEnd();
});

const sdk = new Clerk({ httpClient });
```
<!-- End Custom HTTP Client [http-client] -->

<!-- Start Debugging [debug] -->
## Debugging

You can setup your SDK to emit debug logs for SDK requests and responses.

You can pass a logger that matches `console`'s interface as an SDK option.

> [!WARNING]
> Beware that debug logging will reveal secrets, like API tokens in headers, in log messages printed to a console or files. It's recommended to use this feature only during local development and not in production.

```typescript
import { Clerk } from "@clerk/backend-sdk";

const sdk = new Clerk({ debugLogger: console });
```

You can also enable a default debug logger by setting an environment variable `CLERK_DEBUG` to true.
<!-- End Debugging [debug] -->

<!-- Placeholder for Future Speakeasy SDK Sections -->

# Development

## Maturity

This SDK is in beta, and there may be breaking changes between versions without a major version update. Therefore, we recommend pinning usage
to a specific package version. This way, you can install the same version each time without breaking changes unless you are intentionally
looking for the latest version.

## Contributions

While we value open-source contributions to this SDK, this library is generated programmatically. Any manual changes added to internal files will be overwritten on the next generation.
We look forward to hearing your feedback. Feel free to open a PR or an issue with a proof of concept and we'll do our best to include it in a future release.

### SDK Created by [Speakeasy](https://www.speakeasy.com/?utm_source=@clerk/sdk-backend&utm_campaign=typescript)
