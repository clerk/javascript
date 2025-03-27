# ActorToken

Success

## Example Usage

```typescript
import { ActorToken } from "@clerk/backend-sdk/models/components";

let value: ActorToken = {
  object: "actor_token",
  id: "<id>",
  status: "accepted",
  userId: "<id>",
  actor: {},
  createdAt: 258684,
  updatedAt: 849039,
};
```

## Fields

| Field                                                                      | Type                                                                       | Required                                                                   | Description                                                                |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `object`                                                                   | [components.ActorTokenObject](../../models/components/actortokenobject.md) | :heavy_check_mark:                                                         | N/A                                                                        |
| `id`                                                                       | *string*                                                                   | :heavy_check_mark:                                                         | N/A                                                                        |
| `status`                                                                   | [components.ActorTokenStatus](../../models/components/actortokenstatus.md) | :heavy_check_mark:                                                         | N/A                                                                        |
| `userId`                                                                   | *string*                                                                   | :heavy_check_mark:                                                         | N/A                                                                        |
| `actor`                                                                    | [components.ActorTokenActor](../../models/components/actortokenactor.md)   | :heavy_check_mark:                                                         | N/A                                                                        |
| `token`                                                                    | *string*                                                                   | :heavy_minus_sign:                                                         | N/A                                                                        |
| `url`                                                                      | *string*                                                                   | :heavy_minus_sign:                                                         | N/A                                                                        |
| `createdAt`                                                                | *number*                                                                   | :heavy_check_mark:                                                         | Unix timestamp of creation.<br/>                                           |
| `updatedAt`                                                                | *number*                                                                   | :heavy_check_mark:                                                         | Unix timestamp of last update.<br/>                                        |