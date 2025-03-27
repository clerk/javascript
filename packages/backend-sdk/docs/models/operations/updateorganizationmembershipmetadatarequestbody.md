# UpdateOrganizationMembershipMetadataRequestBody

## Example Usage

```typescript
import { UpdateOrganizationMembershipMetadataRequestBody } from "@clerk/backend-sdk/models/operations";

let value: UpdateOrganizationMembershipMetadataRequestBody = {};
```

## Fields

| Field                                                                                                                                                    | Type                                                                                                                                                     | Required                                                                                                                                                 | Description                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `publicMetadata`                                                                                                                                         | Record<string, *any*>                                                                                                                                    | :heavy_minus_sign:                                                                                                                                       | Metadata saved on the organization membership, that is visible to both your frontend and backend.<br/>The new object will be merged with the existing value. |
| `privateMetadata`                                                                                                                                        | Record<string, *any*>                                                                                                                                    | :heavy_minus_sign:                                                                                                                                       | Metadata saved on the organization membership that is only visible to your backend.<br/>The new object will be merged with the existing value.           |