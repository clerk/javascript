# UpdateInstanceOrganizationSettingsRequestBody

## Example Usage

```typescript
import { UpdateInstanceOrganizationSettingsRequestBody } from '@clerk/backend-sdk/models/operations';

let value: UpdateInstanceOrganizationSettingsRequestBody = {};
```

## Fields

| Field                    | Type       | Required           | Description                                                                                                                                      |
| ------------------------ | ---------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`                | _boolean_  | :heavy_minus_sign: | N/A                                                                                                                                              |
| `maxAllowedMemberships`  | _number_   | :heavy_minus_sign: | N/A                                                                                                                                              |
| `adminDeleteEnabled`     | _boolean_  | :heavy_minus_sign: | N/A                                                                                                                                              |
| `domainsEnabled`         | _boolean_  | :heavy_minus_sign: | N/A                                                                                                                                              |
| `domainsEnrollmentModes` | _string_[] | :heavy_minus_sign: | Specify which enrollment modes to enable for your Organization Domains.<br/>Supported modes are 'automatic_invitation' & 'automatic_suggestion'. |
| `creatorRoleId`          | _string_   | :heavy_minus_sign: | Specify what the default organization role is for an organization creator.                                                                       |
| `domainsDefaultRoleId`   | _string_   | :heavy_minus_sign: | Specify what the default organization role is for the organization domains.                                                                      |
