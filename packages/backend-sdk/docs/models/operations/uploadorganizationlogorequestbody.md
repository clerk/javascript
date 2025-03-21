# UploadOrganizationLogoRequestBody

## Example Usage

```typescript
import { UploadOrganizationLogoRequestBody } from '@clerk/backend-sdk/models/operations';

// No examples available for this model
```

## Fields

| Field            | Type                                                                                                                                                                                                                             | Required           | Description                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------- |
| `file`           | [File](https://developer.mozilla.org/en-US/docs/Web/API/File) \| [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) \| [operations.UploadOrganizationLogoFile](../../models/operations/uploadorganizationlogofile.md) | :heavy_check_mark: | N/A                                                             |
| `uploaderUserId` | _string_                                                                                                                                                                                                                         | :heavy_minus_sign: | The ID of the user that will be credited with the image upload. |
