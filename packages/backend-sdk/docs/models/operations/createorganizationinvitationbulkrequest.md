# CreateOrganizationInvitationBulkRequest

## Example Usage

```typescript
import { CreateOrganizationInvitationBulkRequest } from "@clerk/backend-sdk/models/operations";

let value: CreateOrganizationInvitationBulkRequest = {
  organizationId: "<id>",
  requestBody: [
    {
      emailAddress: "Christa0@gmail.com",
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