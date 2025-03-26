# UpsertTemplateRequest

## Example Usage

```typescript
import { UpsertTemplateRequest } from '@clerk/backend-sdk/models/operations';

let value: UpsertTemplateRequest = {
  templateType: 'email',
  slug: '<value>',
};
```

## Fields

| Field          | Type                                                                                                             | Required           | Description                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------------------- |
| `templateType` | [operations.UpsertTemplatePathParamTemplateType](../../models/operations/upserttemplatepathparamtemplatetype.md) | :heavy_check_mark: | The type of template to update     |
| `slug`         | _string_                                                                                                         | :heavy_check_mark: | The slug of the template to update |
| `requestBody`  | [operations.UpsertTemplateRequestBody](../../models/operations/upserttemplaterequestbody.md)                     | :heavy_minus_sign: | N/A                                |
