# CreateOrganizationRequestBody

## Example Usage

```typescript
import { CreateOrganizationRequestBody } from '@clerk/backend-sdk/models/operations';

let value: CreateOrganizationRequestBody = {
  name: '<value>',
};
```

## Fields

| Field                   | Type                  | Required           | Description                                                                                                                                    |
| ----------------------- | --------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                  | _string_              | :heavy_check_mark: | The name of the new organization.<br/>May not contain URLs or HTML.<br/>Max length: 256                                                        |
| `createdBy`             | _string_              | :heavy_minus_sign: | The ID of the User who will become the administrator for the new organization                                                                  |
| `privateMetadata`       | Record<string, _any_> | :heavy_minus_sign: | Metadata saved on the organization, accessible only from the Backend API                                                                       |
| `publicMetadata`        | Record<string, _any_> | :heavy_minus_sign: | Metadata saved on the organization, read-only from the Frontend API and fully accessible (read/write) from the Backend API                     |
| `slug`                  | _string_              | :heavy_minus_sign: | A slug for the new organization.<br/>Can contain only lowercase alphanumeric characters and the dash "-".<br/>Must be unique for the instance. |
| `maxAllowedMemberships` | _number_              | :heavy_minus_sign: | The maximum number of memberships allowed for this organization                                                                                |
| `createdAt`             | _string_              | :heavy_minus_sign: | A custom date/time denoting _when_ the organization was created, specified in RFC3339 format (e.g. `2012-10-20T07:15:20.902Z`).                |
