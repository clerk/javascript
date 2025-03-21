# RevokeSignInTokenRequest

## Example Usage

```typescript
import { RevokeSignInTokenRequest } from '@clerk/backend-sdk/models/operations';

let value: RevokeSignInTokenRequest = {
  signInTokenId: '<id>',
};
```

## Fields

| Field           | Type     | Required           | Description                               |
| --------------- | -------- | ------------------ | ----------------------------------------- |
| `signInTokenId` | _string_ | :heavy_check_mark: | The ID of the sign-in token to be revoked |
