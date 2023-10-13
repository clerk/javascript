---
'@clerk/clerk-js': minor
'@clerk/clerk-react': minor
'@clerk/types': minor
---

Introduce customization in `UserProfile` and `OrganizationProfile`

The `<UserProfile />` component now allows the addition of custom pages and external links to the navigation sidebar. Custom pages can be created using the `<UserProfile.Page>` component, and external links can be added using the `<UserProfile.Link>` component. The default routes, such as `Account` and `Security`, can be reordered.

Example React API usage:

```tsx
<UserProfile>
  <UserProfile.Page label="Custom Page" url="custom" labelIcon={<CustomIcon />}>
    <MyCustomPageContent />
  </UserProfile.Page>
  <UserProfile.Link label="External" url="/home" labelIcon={<Icon />} />
  <UserProfile.Page label="account" />
  <UserProfile.Page label="security" />
</UserProfile>
```
Custom pages and links should be provided as children using the `<UserButton.UserProfilePage>` and `<UserButton.UserProfileLink>` components when using the `UserButton` component.

The `<OrganizationProfile />` component now supports the addition of custom pages and external links to the navigation sidebar. Custom pages can be created using the `<OrganizationProfile.Page>` component, and external links can be added using the `<OrganizationProfile.Link>` component. The default routes, such as `Members` and `Settings`, can be reordered.

Example React API usage:

```tsx
<OrganizationProfile>
  <OrganizationProfile.Page label="Custom Page" url="custom" labelIcon={<CustomIcon />}>
    <MyCustomPageContent />
  </OrganizationProfile.Page>
  <OrganizationProfile.Link label="External" url="/home" labelIcon={<Icon />} />
  <OrganizationProfile.Page label="members" />
  <OrganizationProfile.Page label="settings" />
</OrganizationProfile>
```
Custom pages and links should be provided as children using the `<OrganizationSwitcher.OrganizationProfilePage>` and `<OrganizationSwitcher.OrganizationProfileLink>` components when using the `OrganizationSwitcher` component.
