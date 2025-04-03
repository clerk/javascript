# UpdateOrganizationDomainRequest

## Example Usage

```typescript
import { UpdateOrganizationDomainRequest } from "@clerk/backend-api-client/models/operations";

let value: UpdateOrganizationDomainRequest = {
  organizationId: "<id>",
  domainId: "<id>",
  requestBody: {},
};
```

## Fields

| Field                                                                                                            | Type                                                                                                             | Required                                                                                                         | Description                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `organizationId`                                                                                                 | *string*                                                                                                         | :heavy_check_mark:                                                                                               | The ID of the organization the domain belongs to                                                                 |
| `domainId`                                                                                                       | *string*                                                                                                         | :heavy_check_mark:                                                                                               | The ID of the domain                                                                                             |
| `requestBody`                                                                                                    | [operations.UpdateOrganizationDomainRequestBody](../../models/operations/updateorganizationdomainrequestbody.md) | :heavy_check_mark:                                                                                               | N/A                                                                                                              |