# CreateOrganizationDomainRequest

## Example Usage

```typescript
import { CreateOrganizationDomainRequest } from "@clerk/backend-api-client/models/operations";

let value: CreateOrganizationDomainRequest = {
  organizationId: "<id>",
  requestBody: {},
};
```

## Fields

| Field                                                                                                            | Type                                                                                                             | Required                                                                                                         | Description                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `organizationId`                                                                                                 | *string*                                                                                                         | :heavy_check_mark:                                                                                               | The ID of the organization where the new domain will be created.                                                 |
| `requestBody`                                                                                                    | [operations.CreateOrganizationDomainRequestBody](../../models/operations/createorganizationdomainrequestbody.md) | :heavy_check_mark:                                                                                               | N/A                                                                                                              |