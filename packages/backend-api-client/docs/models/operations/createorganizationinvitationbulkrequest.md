# CreateOrganizationInvitationBulkRequest

## Example Usage

```typescript
import { CreateOrganizationInvitationBulkRequest } from "@clerk/backend-api-client/models/operations";

let value: CreateOrganizationInvitationBulkRequest = {
  organizationId: "<id>",
  requestBody: [
    {
      emailAddress: "Aletha_Erdman@hotmail.com",
      role: "<value>",
    },
  ],
};
```

## Fields

| Field                                                                                                                              | Type                                                                                                                               | Required                                                                                                                           | Description                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `organizationId`                                                                                                                   | *string*                                                                                                                           | :heavy_check_mark:                                                                                                                 | The organization ID.                                                                                                               |
| `requestBody`                                                                                                                      | [operations.CreateOrganizationInvitationBulkRequestBody](../../models/operations/createorganizationinvitationbulkrequestbody.md)[] | :heavy_check_mark:                                                                                                                 | N/A                                                                                                                                |