# UpdateProductionInstanceDomainRequestBody

## Example Usage

```typescript
import { UpdateProductionInstanceDomainRequestBody } from "@clerk/backend-api-client/models/operations";

let value: UpdateProductionInstanceDomainRequestBody = {};
```

## Fields

| Field                                                                    | Type                                                                     | Required                                                                 | Description                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `homeUrl`                                                                | *string*                                                                 | :heavy_minus_sign:                                                       | The new home URL of the production instance e.g. https://www.example.com |
| `isSecondary`                                                            | *boolean*                                                                | :heavy_minus_sign:                                                       | Whether the domain is a secondary app.                                   |