# UsersGetOrganizationInvitationsRequest

## Example Usage

```typescript
import { UsersGetOrganizationInvitationsRequest } from "@clerk/backend-api-client/models/operations";

let value: UsersGetOrganizationInvitationsRequest = {
  userId: "<id>",
};
```

## Fields

| Field                                                                                                                                     | Type                                                                                                                                      | Required                                                                                                                                  | Description                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `userId`                                                                                                                                  | *string*                                                                                                                                  | :heavy_check_mark:                                                                                                                        | The ID of the user whose organization invitations we want to retrieve                                                                     |
| `limit`                                                                                                                                   | *number*                                                                                                                                  | :heavy_minus_sign:                                                                                                                        | Applies a limit to the number of results returned.<br/>Can be used for paginating the results together with `offset`.                     |
| `offset`                                                                                                                                  | *number*                                                                                                                                  | :heavy_minus_sign:                                                                                                                        | Skip the first `offset` results when paginating.<br/>Needs to be an integer greater or equal to zero.<br/>To be used in conjunction with `limit`. |
| `status`                                                                                                                                  | [operations.QueryParamStatus](../../models/operations/queryparamstatus.md)                                                                | :heavy_minus_sign:                                                                                                                        | Filter organization invitations based on their status                                                                                     |