# SignInToken

Success

## Example Usage

```typescript
import { SignInToken } from '@clerk/backend-sdk/models/components';

let value: SignInToken = {
  object: 'sign_in_token',
  id: '<id>',
  status: 'pending',
  userId: '<id>',
  createdAt: 502389,
  updatedAt: 942584,
};
```

## Fields

| Field       | Type                                                                         | Required           | Description                         |
| ----------- | ---------------------------------------------------------------------------- | ------------------ | ----------------------------------- |
| `object`    | [components.SignInTokenObject](../../models/components/signintokenobject.md) | :heavy_check_mark: | N/A                                 |
| `id`        | _string_                                                                     | :heavy_check_mark: | N/A                                 |
| `status`    | [components.SignInTokenStatus](../../models/components/signintokenstatus.md) | :heavy_check_mark: | N/A                                 |
| `userId`    | _string_                                                                     | :heavy_check_mark: | N/A                                 |
| `token`     | _string_                                                                     | :heavy_minus_sign: | N/A                                 |
| `url`       | _string_                                                                     | :heavy_minus_sign: | N/A                                 |
| `createdAt` | _number_                                                                     | :heavy_check_mark: | Unix timestamp of creation.<br/>    |
| `updatedAt` | _number_                                                                     | :heavy_check_mark: | Unix timestamp of last update.<br/> |
