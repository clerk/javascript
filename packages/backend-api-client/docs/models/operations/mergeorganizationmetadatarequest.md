# MergeOrganizationMetadataRequest

## Example Usage

```typescript
import { MergeOrganizationMetadataRequest } from "@clerk/backend-api-client/models/operations";

let value: MergeOrganizationMetadataRequest = {
  organizationId: "<id>",
  requestBody: {},
};
```

## Fields

| Field                                                                                                              | Type                                                                                                               | Required                                                                                                           | Description                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `organizationId`                                                                                                   | *string*                                                                                                           | :heavy_check_mark:                                                                                                 | The ID of the organization for which metadata will be merged or updated                                            |
| `requestBody`                                                                                                      | [operations.MergeOrganizationMetadataRequestBody](../../models/operations/mergeorganizationmetadatarequestbody.md) | :heavy_check_mark:                                                                                                 | N/A                                                                                                                |