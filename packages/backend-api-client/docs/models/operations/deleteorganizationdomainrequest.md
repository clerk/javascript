# DeleteOrganizationDomainRequest

## Example Usage

```typescript
import { DeleteOrganizationDomainRequest } from "@clerk/backend-api-client/models/operations";

let value: DeleteOrganizationDomainRequest = {
  organizationId: "<id>",
  domainId: "<id>",
};
```

## Fields

| Field                                            | Type                                             | Required                                         | Description                                      |
| ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ |
| `organizationId`                                 | *string*                                         | :heavy_check_mark:                               | The ID of the organization the domain belongs to |
| `domainId`                                       | *string*                                         | :heavy_check_mark:                               | The ID of the domain                             |