# UpdateOrganizationRequest

## Example Usage

```typescript
import { UpdateOrganizationRequest } from "@clerk/backend-api-client/models/operations";

let value: UpdateOrganizationRequest = {
  organizationId: "<id>",
  requestBody: {},
};
```

## Fields

| Field                                                                                                | Type                                                                                                 | Required                                                                                             | Description                                                                                          |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `organizationId`                                                                                     | *string*                                                                                             | :heavy_check_mark:                                                                                   | The ID of the organization to update                                                                 |
| `requestBody`                                                                                        | [operations.UpdateOrganizationRequestBody](../../models/operations/updateorganizationrequestbody.md) | :heavy_check_mark:                                                                                   | N/A                                                                                                  |