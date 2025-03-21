# ErrorClerkError

## Example Usage

```typescript
import { ErrorClerkError } from '@clerk/backend-sdk/models/components';

let value: ErrorClerkError = {
  message: '<value>',
  longMessage: '<value>',
  code: '<value>',
};
```

## Fields

| Field          | Type                                                         | Required           | Description |
| -------------- | ------------------------------------------------------------ | ------------------ | ----------- |
| `message`      | _string_                                                     | :heavy_check_mark: | N/A         |
| `longMessage`  | _string_                                                     | :heavy_check_mark: | N/A         |
| `code`         | _string_                                                     | :heavy_check_mark: | N/A         |
| `meta`         | [components.ErrorMeta](../../models/components/errormeta.md) | :heavy_minus_sign: | N/A         |
| `clerkTraceId` | _string_                                                     | :heavy_minus_sign: | N/A         |
