# ActorToken

Success

## Example Usage

```typescript
import { ActorToken } from '@clerk/backend-sdk/models/components';

let value: ActorToken = {
  object: 'actor_token',
  id: '<id>',
  status: 'accepted',
  userId: '<id>',
  actor: {},
  createdAt: 258684,
  updatedAt: 849039,
};
```

## Fields

| Field       | Type                                                                       | Required           | Description                         |
| ----------- | -------------------------------------------------------------------------- | ------------------ | ----------------------------------- |
| `object`    | [components.ActorTokenObject](../../models/components/actortokenobject.md) | :heavy_check_mark: | N/A                                 |
| `id`        | _string_                                                                   | :heavy_check_mark: | N/A                                 |
| `status`    | [components.ActorTokenStatus](../../models/components/actortokenstatus.md) | :heavy_check_mark: | N/A                                 |
| `userId`    | _string_                                                                   | :heavy_check_mark: | N/A                                 |
| `actor`     | [components.ActorTokenActor](../../models/components/actortokenactor.md)   | :heavy_check_mark: | N/A                                 |
| `token`     | _string_                                                                   | :heavy_minus_sign: | N/A                                 |
| `url`       | _string_                                                                   | :heavy_minus_sign: | N/A                                 |
| `createdAt` | _number_                                                                   | :heavy_check_mark: | Unix timestamp of creation.<br/>    |
| `updatedAt` | _number_                                                                   | :heavy_check_mark: | Unix timestamp of last update.<br/> |
