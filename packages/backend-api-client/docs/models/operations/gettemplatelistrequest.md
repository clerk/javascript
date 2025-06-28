# GetTemplateListRequest

## Example Usage

```typescript
import { GetTemplateListRequest } from "@clerk/backend-api-client/models/operations";

let value: GetTemplateListRequest = {
  templateType: "sms",
};
```

## Fields

| Field                                                                                                                                     | Type                                                                                                                                      | Required                                                                                                                                  | Description                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `templateType`                                                                                                                            | [operations.TemplateType](../../models/operations/templatetype.md)                                                                        | :heavy_check_mark:                                                                                                                        | The type of templates to list (email or SMS)                                                                                              |
| `paginated`                                                                                                                               | *boolean*                                                                                                                                 | :heavy_minus_sign:                                                                                                                        | Whether to paginate the results.<br/>If true, the results will be paginated.<br/>If false, the results will not be paginated.             |
| `limit`                                                                                                                                   | *number*                                                                                                                                  | :heavy_minus_sign:                                                                                                                        | Applies a limit to the number of results returned.<br/>Can be used for paginating the results together with `offset`.                     |
| `offset`                                                                                                                                  | *number*                                                                                                                                  | :heavy_minus_sign:                                                                                                                        | Skip the first `offset` results when paginating.<br/>Needs to be an integer greater or equal to zero.<br/>To be used in conjunction with `limit`. |