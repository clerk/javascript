# InvitationRevoked

Success

## Example Usage

```typescript
import { InvitationRevoked } from '@clerk/backend-sdk/models/components';

let value: InvitationRevoked = {
  object: 'invitation',
  id: '<id>',
  emailAddress: 'Vicenta.Barton@yahoo.com',
  publicMetadata: {
    key: '<value>',
  },
  revoked: true,
  status: 'revoked',
  createdAt: 681393,
  updatedAt: 277596,
};
```

## Fields

| Field            | Type                                                                                     | Required           | Description                         | Example |
| ---------------- | ---------------------------------------------------------------------------------------- | ------------------ | ----------------------------------- | ------- |
| `object`         | [components.InvitationRevokedObject](../../models/components/invitationrevokedobject.md) | :heavy_check_mark: | N/A                                 |         |
| `id`             | _string_                                                                                 | :heavy_check_mark: | N/A                                 |         |
| `emailAddress`   | _string_                                                                                 | :heavy_check_mark: | N/A                                 |         |
| `publicMetadata` | Record<string, _any_>                                                                    | :heavy_check_mark: | N/A                                 |         |
| `revoked`        | _boolean_                                                                                | :heavy_minus_sign: | N/A                                 | true    |
| `status`         | [components.InvitationRevokedStatus](../../models/components/invitationrevokedstatus.md) | :heavy_check_mark: | N/A                                 | revoked |
| `url`            | _string_                                                                                 | :heavy_minus_sign: | N/A                                 |         |
| `expiresAt`      | _number_                                                                                 | :heavy_minus_sign: | Unix timestamp of expiration.<br/>  |         |
| `createdAt`      | _number_                                                                                 | :heavy_check_mark: | Unix timestamp of creation.<br/>    |         |
| `updatedAt`      | _number_                                                                                 | :heavy_check_mark: | Unix timestamp of last update.<br/> |         |
