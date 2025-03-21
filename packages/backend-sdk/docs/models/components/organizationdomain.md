# OrganizationDomain

An organization domain

## Example Usage

```typescript
import { OrganizationDomain } from '@clerk/backend-sdk/models/components';

let value: OrganizationDomain = {
  object: 'organization_domain',
  id: '<id>',
  organizationId: '<id>',
  name: '<value>',
  enrollmentMode: 'automatic_suggestion',
  affiliationEmailAddress: '<value>',
  verification: {
    status: 'unverified',
    strategy: '<value>',
    attempts: 360545,
    expireAt: 828657,
  },
  totalPendingInvitations: 924967,
  totalPendingSuggestions: 46007,
  createdAt: 232627,
  updatedAt: 348519,
};
```

## Fields

| Field                     | Type                                                                                                   | Required           | Description                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `object`                  | [components.OrganizationDomainObject](../../models/components/organizationdomainobject.md)             | :heavy_check_mark: | String representing the object's type. Objects of the same type share the same value. Always `organization_domain`<br/> |
| `id`                      | _string_                                                                                               | :heavy_check_mark: | Unique identifier for the organization domain                                                                           |
| `organizationId`          | _string_                                                                                               | :heavy_check_mark: | Unique identifier for the organization                                                                                  |
| `name`                    | _string_                                                                                               | :heavy_check_mark: | Name of the organization domain                                                                                         |
| `enrollmentMode`          | [components.EnrollmentMode](../../models/components/enrollmentmode.md)                                 | :heavy_check_mark: | Mode of enrollment for the domain                                                                                       |
| `affiliationEmailAddress` | _string_                                                                                               | :heavy_check_mark: | Affiliation email address for the domain, if available.                                                                 |
| `verification`            | [components.OrganizationDomainVerification](../../models/components/organizationdomainverification.md) | :heavy_check_mark: | Verification details for the domain                                                                                     |
| `totalPendingInvitations` | _number_                                                                                               | :heavy_check_mark: | Total number of pending invitations associated with this domain                                                         |
| `totalPendingSuggestions` | _number_                                                                                               | :heavy_check_mark: | Total number of pending suggestions associated with this domain                                                         |
| `createdAt`               | _number_                                                                                               | :heavy_check_mark: | Unix timestamp when the domain was created                                                                              |
| `updatedAt`               | _number_                                                                                               | :heavy_check_mark: | Unix timestamp of the last update to the domain                                                                         |
