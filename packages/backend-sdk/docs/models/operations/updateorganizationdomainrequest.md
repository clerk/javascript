# UpdateOrganizationDomainRequest

## Example Usage

```typescript
import { UpdateOrganizationDomainRequest } from '@clerk/backend-sdk/models/operations';

let value: UpdateOrganizationDomainRequest = {
  organizationId: '<id>',
  domainId: '<id>',
  requestBody: {},
};
```

## Fields

| Field            | Type                                                                                                             | Required           | Description                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------ |
| `organizationId` | _string_                                                                                                         | :heavy_check_mark: | The ID of the organization the domain belongs to |
| `domainId`       | _string_                                                                                                         | :heavy_check_mark: | The ID of the domain                             |
| `requestBody`    | [operations.UpdateOrganizationDomainRequestBody](../../models/operations/updateorganizationdomainrequestbody.md) | :heavy_check_mark: | N/A                                              |
