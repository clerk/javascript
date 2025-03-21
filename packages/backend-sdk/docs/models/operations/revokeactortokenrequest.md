# RevokeActorTokenRequest

## Example Usage

```typescript
import { RevokeActorTokenRequest } from '@clerk/backend-sdk/models/operations';

let value: RevokeActorTokenRequest = {
  actorTokenId: '<id>',
};
```

## Fields

| Field          | Type     | Required           | Description                              |
| -------------- | -------- | ------------------ | ---------------------------------------- |
| `actorTokenId` | _string_ | :heavy_check_mark: | The ID of the actor token to be revoked. |
