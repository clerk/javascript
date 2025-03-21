# WaitlistEntryInvitation

## Example Usage

```typescript
import { WaitlistEntryInvitation } from '@clerk/backend-sdk/models/components';

let value: WaitlistEntryInvitation = {
  object: 'invitation',
  id: '<id>',
  emailAddress: 'Ryleigh45@gmail.com',
  publicMetadata: {
    key: '<value>',
  },
  revoked: false,
  status: 'pending',
  createdAt: 423706,
  updatedAt: 857125,
};
```

## Fields

| Field            | Type                                                                                                 | Required           | Description                         | Example |
| ---------------- | ---------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------- | ------- |
| `object`         | [components.WaitlistEntryInvitationObject](../../models/components/waitlistentryinvitationobject.md) | :heavy_check_mark: | N/A                                 |         |
| `id`             | _string_                                                                                             | :heavy_check_mark: | N/A                                 |         |
| `emailAddress`   | _string_                                                                                             | :heavy_check_mark: | N/A                                 |         |
| `publicMetadata` | Record<string, _any_>                                                                                | :heavy_check_mark: | N/A                                 |         |
| `revoked`        | _boolean_                                                                                            | :heavy_minus_sign: | N/A                                 | false   |
| `status`         | [components.WaitlistEntryInvitationStatus](../../models/components/waitlistentryinvitationstatus.md) | :heavy_check_mark: | N/A                                 | pending |
| `url`            | _string_                                                                                             | :heavy_minus_sign: | N/A                                 |         |
| `expiresAt`      | _number_                                                                                             | :heavy_minus_sign: | Unix timestamp of expiration.<br/>  |         |
| `createdAt`      | _number_                                                                                             | :heavy_check_mark: | Unix timestamp of creation.<br/>    |         |
| `updatedAt`      | _number_                                                                                             | :heavy_check_mark: | Unix timestamp of last update.<br/> |         |
