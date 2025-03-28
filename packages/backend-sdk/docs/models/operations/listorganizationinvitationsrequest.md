# ListOrganizationInvitationsRequest

## Example Usage

```typescript
import { ListOrganizationInvitationsRequest } from "@clerk/backend-sdk/models/operations";

let value: ListOrganizationInvitationsRequest = {
  organizationId: "<id>",
};
```

## Fields

| Field                                                                                                                                     | Type                                                                                                                                      | Required                                                                                                                                  | Description                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `organizationId`                                                                                                                          | *string*                                                                                                                                  | :heavy_check_mark:                                                                                                                        | The organization ID.                                                                                                                      |
| `status`                                                                                                                                  | [operations.ListOrganizationInvitationsQueryParamStatus](../../models/operations/listorganizationinvitationsqueryparamstatus.md)          | :heavy_minus_sign:                                                                                                                        | Filter organization invitations based on their status                                                                                     |
| `limit`                                                                                                                                   | *number*                                                                                                                                  | :heavy_minus_sign:                                                                                                                        | Applies a limit to the number of results returned.<br/>Can be used for paginating the results together with `offset`.                     |
| `offset`                                                                                                                                  | *number*                                                                                                                                  | :heavy_minus_sign:                                                                                                                        | Skip the first `offset` results when paginating.<br/>Needs to be an integer greater or equal to zero.<br/>To be used in conjunction with `limit`. |