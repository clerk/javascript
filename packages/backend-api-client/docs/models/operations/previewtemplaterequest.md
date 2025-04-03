# PreviewTemplateRequest

## Example Usage

```typescript
import { PreviewTemplateRequest } from "@clerk/backend-api-client/models/operations";

let value: PreviewTemplateRequest = {
  templateType: "<value>",
  slug: "<value>",
};
```

## Fields

| Field                                                                                          | Type                                                                                           | Required                                                                                       | Description                                                                                    |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `templateType`                                                                                 | *string*                                                                                       | :heavy_check_mark:                                                                             | The type of template to preview                                                                |
| `slug`                                                                                         | *string*                                                                                       | :heavy_check_mark:                                                                             | The slug of the template to preview                                                            |
| `requestBody`                                                                                  | [operations.PreviewTemplateRequestBody](../../models/operations/previewtemplaterequestbody.md) | :heavy_minus_sign:                                                                             | Required parameters                                                                            |