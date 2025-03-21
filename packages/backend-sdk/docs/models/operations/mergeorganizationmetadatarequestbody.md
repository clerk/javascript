# MergeOrganizationMetadataRequestBody

## Example Usage

```typescript
import { MergeOrganizationMetadataRequestBody } from '@clerk/backend-sdk/models/operations';

let value: MergeOrganizationMetadataRequestBody = {};
```

## Fields

| Field             | Type                  | Required           | Description                                                                                                                                       |
| ----------------- | --------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `publicMetadata`  | Record<string, _any_> | :heavy_minus_sign: | Metadata saved on the organization, that is visible to both your frontend and backend.<br/>The new object will be merged with the existing value. |
| `privateMetadata` | Record<string, _any_> | :heavy_minus_sign: | Metadata saved on the organization that is only visible to your backend.<br/>The new object will be merged with the existing value.               |
