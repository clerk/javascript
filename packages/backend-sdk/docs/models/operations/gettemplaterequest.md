# GetTemplateRequest

## Example Usage

```typescript
import { GetTemplateRequest } from "@clerk/backend-sdk/models/operations";

let value: GetTemplateRequest = {
  templateType: "sms",
  slug: "<value>",
};
```

## Fields

| Field                                                                                | Type                                                                                 | Required                                                                             | Description                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `templateType`                                                                       | [operations.PathParamTemplateType](../../models/operations/pathparamtemplatetype.md) | :heavy_check_mark:                                                                   | The type of templates to retrieve (email or SMS)                                     |
| `slug`                                                                               | *string*                                                                             | :heavy_check_mark:                                                                   | The slug (i.e. machine-friendly name) of the template to retrieve                    |