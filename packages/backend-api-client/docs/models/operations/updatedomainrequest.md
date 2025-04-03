# UpdateDomainRequest

## Example Usage

```typescript
import { UpdateDomainRequest } from "@clerk/backend-api-client/models/operations";

let value: UpdateDomainRequest = {
  domainId: "<id>",
  requestBody: {},
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `domainId`                                                                               | *string*                                                                                 | :heavy_check_mark:                                                                       | The ID of the domain that will be updated.                                               |
| `requestBody`                                                                            | [operations.UpdateDomainRequestBody](../../models/operations/updatedomainrequestbody.md) | :heavy_check_mark:                                                                       | N/A                                                                                      |