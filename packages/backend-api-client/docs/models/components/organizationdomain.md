# OrganizationDomain

An organization domain

## Example Usage

```typescript
import { OrganizationDomain } from "@clerk/backend-api-client/models/components";

let value: OrganizationDomain = {
  object: "organization_domain",
  id: "<id>",
  organizationId: "<id>",
  name: "<value>",
  enrollmentMode: "automatic_suggestion",
  affiliationEmailAddress: "<value>",
  verification: {
    status: "verified",
    strategy: "<value>",
    attempts: 151278,
    expireAt: 451117,
  },
  totalPendingInvitations: 195211,
  totalPendingSuggestions: 406321,
  createdAt: 84447,
  updatedAt: 140929,
};
```

## Fields

| Field                                                                                                               | Type                                                                                                                | Required                                                                                                            | Description                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `object`                                                                                                            | [components.OrganizationDomainObject](../../models/components/organizationdomainobject.md)                          | :heavy_check_mark:                                                                                                  | String representing the object's type. Objects of the same type share the same value. Always `organization_domain`<br/> |
| `id`                                                                                                                | *string*                                                                                                            | :heavy_check_mark:                                                                                                  | Unique identifier for the organization domain                                                                       |
| `organizationId`                                                                                                    | *string*                                                                                                            | :heavy_check_mark:                                                                                                  | Unique identifier for the organization                                                                              |
| `name`                                                                                                              | *string*                                                                                                            | :heavy_check_mark:                                                                                                  | Name of the organization domain                                                                                     |
| `enrollmentMode`                                                                                                    | [components.EnrollmentMode](../../models/components/enrollmentmode.md)                                              | :heavy_check_mark:                                                                                                  | Mode of enrollment for the domain                                                                                   |
| `affiliationEmailAddress`                                                                                           | *string*                                                                                                            | :heavy_check_mark:                                                                                                  | Affiliation email address for the domain, if available.                                                             |
| `verification`                                                                                                      | [components.OrganizationDomainVerification](../../models/components/organizationdomainverification.md)              | :heavy_check_mark:                                                                                                  | Verification details for the domain                                                                                 |
| `totalPendingInvitations`                                                                                           | *number*                                                                                                            | :heavy_check_mark:                                                                                                  | Total number of pending invitations associated with this domain                                                     |
| `totalPendingSuggestions`                                                                                           | *number*                                                                                                            | :heavy_check_mark:                                                                                                  | Total number of pending suggestions associated with this domain                                                     |
| `createdAt`                                                                                                         | *number*                                                                                                            | :heavy_check_mark:                                                                                                  | Unix timestamp when the domain was created                                                                          |
| `updatedAt`                                                                                                         | *number*                                                                                                            | :heavy_check_mark:                                                                                                  | Unix timestamp of the last update to the domain                                                                     |