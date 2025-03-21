# UpdateProductionInstanceDomainRequestBody

## Example Usage

```typescript
import { UpdateProductionInstanceDomainRequestBody } from '@clerk/backend-sdk/models/operations';

let value: UpdateProductionInstanceDomainRequestBody = {};
```

## Fields

| Field         | Type      | Required           | Description                                                              |
| ------------- | --------- | ------------------ | ------------------------------------------------------------------------ |
| `homeUrl`     | _string_  | :heavy_minus_sign: | The new home URL of the production instance e.g. https://www.example.com |
| `isSecondary` | _boolean_ | :heavy_minus_sign: | Whether the domain is a secondary app.                                   |
