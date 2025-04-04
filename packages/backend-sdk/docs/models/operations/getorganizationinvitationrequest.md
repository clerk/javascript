# GetOrganizationInvitationRequest

## Example Usage

```typescript
import { GetOrganizationInvitationRequest } from "@clerk/backend-sdk/models/operations";

let value: GetOrganizationInvitationRequest = {
  organizationId: "<id>",
  invitationId: "<id>",
};
```

## Fields

| Field                           | Type                            | Required                        | Description                     |
| ------------------------------- | ------------------------------- | ------------------------------- | ------------------------------- |
| `organizationId`                | *string*                        | :heavy_check_mark:              | The organization ID.            |
| `invitationId`                  | *string*                        | :heavy_check_mark:              | The organization invitation ID. |