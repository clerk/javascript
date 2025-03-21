# FromOAuth

## Example Usage

```typescript
import { FromOAuth } from '@clerk/backend-sdk/models/components';

let value: FromOAuth = {
  status: 'verified',
  strategy: '<value>',
  expireAt: 431418,
  attempts: 896547,
};
```

## Fields

| Field              | Type                                                                                             | Required           | Description |
| ------------------ | ------------------------------------------------------------------------------------------------ | ------------------ | ----------- |
| `status`           | [components.FromOAuthVerificationStatus](../../models/components/fromoauthverificationstatus.md) | :heavy_check_mark: | N/A         |
| `strategy`         | _string_                                                                                         | :heavy_check_mark: | N/A         |
| `error`            | _components.ErrorT_                                                                              | :heavy_minus_sign: | N/A         |
| `expireAt`         | _number_                                                                                         | :heavy_check_mark: | N/A         |
| `attempts`         | _number_                                                                                         | :heavy_check_mark: | N/A         |
| `verifiedAtClient` | _string_                                                                                         | :heavy_minus_sign: | N/A         |
