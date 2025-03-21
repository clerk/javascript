# SchemasPasskey

## Example Usage

```typescript
import { SchemasPasskey } from '@clerk/backend-sdk/models/components';

let value: SchemasPasskey = {
  object: 'passkey',
  name: '<value>',
  lastUsedAt: 100294,
  verification: {
    status: 'verified',
    strategy: 'passkey',
    attempts: 16429,
    expireAt: 929530,
  },
};
```

## Fields

| Field          | Type                                                                               | Required           | Description                                                                                |
| -------------- | ---------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `id`           | _string_                                                                           | :heavy_minus_sign: | N/A                                                                                        |
| `object`       | [components.SchemasPasskeyObject](../../models/components/schemaspasskeyobject.md) | :heavy_check_mark: | String representing the object's type. Objects of the same type share the same value.<br/> |
| `name`         | _string_                                                                           | :heavy_check_mark: | N/A                                                                                        |
| `lastUsedAt`   | _number_                                                                           | :heavy_check_mark: | Unix timestamp of when the passkey was last used.<br/>                                     |
| `verification` | _components.SchemasPasskeyVerification_                                            | :heavy_check_mark: | N/A                                                                                        |
