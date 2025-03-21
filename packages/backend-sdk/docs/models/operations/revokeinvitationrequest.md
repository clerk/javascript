# RevokeInvitationRequest

## Example Usage

```typescript
import { RevokeInvitationRequest } from '@clerk/backend-sdk/models/operations';

let value: RevokeInvitationRequest = {
  invitationId: '<id>',
};
```

## Fields

| Field          | Type     | Required           | Description                            |
| -------------- | -------- | ------------------ | -------------------------------------- |
| `invitationId` | _string_ | :heavy_check_mark: | The ID of the invitation to be revoked |
