# UpdateOrganizationMembershipMetadataRequest

## Example Usage

```typescript
import { UpdateOrganizationMembershipMetadataRequest } from "@clerk/backend-sdk/models/operations";

let value: UpdateOrganizationMembershipMetadataRequest = {
  organizationId: "<id>",
  userId: "<id>",
};
```

## Fields

| Field                                                                                                                                    | Type                                                                                                                                     | Required                                                                                                                                 | Description                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `organizationId`                                                                                                                         | *string*                                                                                                                                 | :heavy_check_mark:                                                                                                                       | The ID of the organization the membership belongs to                                                                                     |
| `userId`                                                                                                                                 | *string*                                                                                                                                 | :heavy_check_mark:                                                                                                                       | The ID of the user that this membership belongs to                                                                                       |
| `requestBody`                                                                                                                            | [operations.UpdateOrganizationMembershipMetadataRequestBody](../../models/operations/updateorganizationmembershipmetadatarequestbody.md) | :heavy_minus_sign:                                                                                                                       | N/A                                                                                                                                      |