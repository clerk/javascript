# RevokeInvitationRequest

## Example Usage

```typescript
import { RevokeInvitationRequest } from "@clerk/backend-api-client/models/operations";

let value: RevokeInvitationRequest = {
  invitationId: "<id>",
};
```

## Fields

| Field                                  | Type                                   | Required                               | Description                            |
| -------------------------------------- | -------------------------------------- | -------------------------------------- | -------------------------------------- |
| `invitationId`                         | *string*                               | :heavy_check_mark:                     | The ID of the invitation to be revoked |