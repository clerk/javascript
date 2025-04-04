# OrganizationSettings

Success

## Example Usage

```typescript
import { OrganizationSettings } from "@clerk/backend-sdk/models/components";

let value: OrganizationSettings = {
  object: "organization_settings",
  enabled: false,
  maxAllowedMemberships: 287051,
  maxAllowedRoles: 706575,
  maxAllowedPermissions: 414857,
  creatorRole: "<value>",
  adminDeleteEnabled: false,
  domainsEnabled: false,
  domainsEnrollmentModes: [
    "automatic_invitation",
  ],
  domainsDefaultRole: "<value>",
};
```

## Fields

| Field                                                                                          | Type                                                                                           | Required                                                                                       | Description                                                                                    |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `object`                                                                                       | [components.OrganizationSettingsObject](../../models/components/organizationsettingsobject.md) | :heavy_check_mark:                                                                             | String representing the object's type. Objects of the same type share the same value.          |
| `enabled`                                                                                      | *boolean*                                                                                      | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `maxAllowedMemberships`                                                                        | *number*                                                                                       | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `maxAllowedRoles`                                                                              | *number*                                                                                       | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `maxAllowedPermissions`                                                                        | *number*                                                                                       | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `creatorRole`                                                                                  | *string*                                                                                       | :heavy_check_mark:                                                                             | The role key that a user will be assigned after creating an organization.                      |
| `adminDeleteEnabled`                                                                           | *boolean*                                                                                      | :heavy_check_mark:                                                                             | The default for whether an admin can delete an organization with the Frontend API.             |
| `domainsEnabled`                                                                               | *boolean*                                                                                      | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `domainsEnrollmentModes`                                                                       | [components.DomainsEnrollmentModes](../../models/components/domainsenrollmentmodes.md)[]       | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `domainsDefaultRole`                                                                           | *string*                                                                                       | :heavy_check_mark:                                                                             | The role key that it will be used in order to create an organization invitation or suggestion. |