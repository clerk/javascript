# DeleteOrganizationDomainRequest

## Example Usage

```typescript
import { DeleteOrganizationDomainRequest } from '@clerk/backend-sdk/models/operations';

let value: DeleteOrganizationDomainRequest = {
  organizationId: '<id>',
  domainId: '<id>',
};
```

## Fields

| Field            | Type     | Required           | Description                                      |
| ---------------- | -------- | ------------------ | ------------------------------------------------ |
| `organizationId` | _string_ | :heavy_check_mark: | The ID of the organization the domain belongs to |
| `domainId`       | _string_ | :heavy_check_mark: | The ID of the domain                             |
