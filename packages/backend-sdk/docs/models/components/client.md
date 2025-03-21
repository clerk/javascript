# Client

Success

## Example Usage

```typescript
import { Client } from '@clerk/backend-sdk/models/components';

let value: Client = {
  object: 'client',
  id: '<id>',
  sessionIds: ['<value>'],
  sessions: [
    {
      object: 'session',
      id: '<id>',
      userId: '<id>',
      clientId: '<id>',
      status: 'replaced',
      lastActiveAt: 692532,
      expireAt: 725255,
      abandonAt: 501324,
      updatedAt: 956084,
      createdAt: 643990,
    },
  ],
  signInId: '<id>',
  signUpId: '<id>',
  lastActiveSessionId: '<id>',
  updatedAt: 423855,
  createdAt: 606393,
};
```

## Fields

| Field                 | Type                                                       | Required           | Description                                                                                |
| --------------------- | ---------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `object`              | [components.ObjectT](../../models/components/objectt.md)   | :heavy_check_mark: | String representing the object's type. Objects of the same type share the same value.<br/> |
| `id`                  | _string_                                                   | :heavy_check_mark: | String representing the identifier of the session.<br/>                                    |
| `sessionIds`          | _string_[]                                                 | :heavy_check_mark: | N/A                                                                                        |
| `sessions`            | [components.Session](../../models/components/session.md)[] | :heavy_check_mark: | N/A                                                                                        |
| `signInId`            | _string_                                                   | :heavy_check_mark: | N/A                                                                                        |
| `signUpId`            | _string_                                                   | :heavy_check_mark: | N/A                                                                                        |
| `lastActiveSessionId` | _string_                                                   | :heavy_check_mark: | Last active session_id.<br/>                                                               |
| `updatedAt`           | _number_                                                   | :heavy_check_mark: | Unix timestamp of last update.<br/>                                                        |
| `createdAt`           | _number_                                                   | :heavy_check_mark: | Unix timestamp of creation.<br/>                                                           |
