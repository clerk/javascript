# CreateOrganizationDomainRequestBody

## Example Usage

```typescript
import { CreateOrganizationDomainRequestBody } from '@clerk/backend-sdk/models/operations';

let value: CreateOrganizationDomainRequestBody = {};
```

## Fields

| Field            | Type      | Required           | Description                                                                                                               |
| ---------------- | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `name`           | _string_  | :heavy_minus_sign: | The name of the new domain                                                                                                |
| `enrollmentMode` | _string_  | :heavy_minus_sign: | The enrollment_mode for the new domain. This can be `automatic_invitation`, `automatic_suggestion` or `manual_invitation` |
| `verified`       | _boolean_ | :heavy_minus_sign: | The status of domain's verification. Defaults to true                                                                     |
