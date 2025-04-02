# Session

## Example Usage

```typescript
import { Session } from "@clerk/backend-sdk/models/components";

let value: Session = {
  object: "session",
  id: "<id>",
  userId: "<id>",
  clientId: "<id>",
  status: "ended",
  lastActiveAt: 660174,
  expireAt: 290077,
  abandonAt: 618016,
  updatedAt: 428769,
  createdAt: 135474,
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `object`                                                                                 | [components.SessionObject](../../models/components/sessionobject.md)                     | :heavy_check_mark:                                                                       | String representing the object's type. Objects of the same type share the same value.<br/> |
| `id`                                                                                     | *string*                                                                                 | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `userId`                                                                                 | *string*                                                                                 | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `clientId`                                                                               | *string*                                                                                 | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `actor`                                                                                  | [components.Actor](../../models/components/actor.md)                                     | :heavy_minus_sign:                                                                       | N/A                                                                                      |
| `status`                                                                                 | [components.Status](../../models/components/status.md)                                   | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `lastActiveOrganizationId`                                                               | *string*                                                                                 | :heavy_minus_sign:                                                                       | N/A                                                                                      |
| `lastActiveAt`                                                                           | *number*                                                                                 | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `latestActivity`                                                                         | [components.SessionActivityResponse](../../models/components/sessionactivityresponse.md) | :heavy_minus_sign:                                                                       | N/A                                                                                      |
| `expireAt`                                                                               | *number*                                                                                 | :heavy_check_mark:                                                                       | Unix timestamp of expiration.<br/>                                                       |
| `abandonAt`                                                                              | *number*                                                                                 | :heavy_check_mark:                                                                       | Unix timestamp of abandonment.<br/>                                                      |
| `updatedAt`                                                                              | *number*                                                                                 | :heavy_check_mark:                                                                       | Unix timestamp of last update.<br/>                                                      |
| `createdAt`                                                                              | *number*                                                                                 | :heavy_check_mark:                                                                       | Unix timestamp of creation.<br/>                                                         |
| `tasks`                                                                                  | [components.SessionTask](../../models/components/sessiontask.md)[]                       | :heavy_minus_sign:                                                                       | N/A                                                                                      |