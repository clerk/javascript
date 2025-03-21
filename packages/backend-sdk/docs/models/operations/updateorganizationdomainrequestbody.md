# UpdateOrganizationDomainRequestBody

## Example Usage

```typescript
import { UpdateOrganizationDomainRequestBody } from '@clerk/backend-sdk/models/operations';

let value: UpdateOrganizationDomainRequestBody = {};
```

## Fields

| Field            | Type      | Required           | Description                                                                                                               |
| ---------------- | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `enrollmentMode` | _string_  | :heavy_minus_sign: | The enrollment_mode for the new domain. This can be `automatic_invitation`, `automatic_suggestion` or `manual_invitation` |
| `verified`       | _boolean_ | :heavy_minus_sign: | The status of the domain's verification                                                                                   |
