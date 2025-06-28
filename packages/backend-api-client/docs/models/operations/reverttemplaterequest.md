# RevertTemplateRequest

## Example Usage

```typescript
import { RevertTemplateRequest } from "@clerk/backend-api-client/models/operations";

let value: RevertTemplateRequest = {
  templateType: "email",
  slug: "<value>",
};
```

## Fields

| Field                                                                                                            | Type                                                                                                             | Required                                                                                                         | Description                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `templateType`                                                                                                   | [operations.RevertTemplatePathParamTemplateType](../../models/operations/reverttemplatepathparamtemplatetype.md) | :heavy_check_mark:                                                                                               | The type of template to revert                                                                                   |
| `slug`                                                                                                           | *string*                                                                                                         | :heavy_check_mark:                                                                                               | The slug of the template to revert                                                                               |