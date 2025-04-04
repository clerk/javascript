# SchemasPasskey

## Example Usage

```typescript
import { SchemasPasskey } from "@clerk/backend-sdk/models/components";

let value: SchemasPasskey = {
  object: "passkey",
  name: "<value>",
  lastUsedAt: 189848,
  verification: {
    status: "verified",
    strategy: "passkey",
    attempts: 511319,
    expireAt: 224317,
  },
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `id`                                                                                   | *string*                                                                               | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `object`                                                                               | [components.SchemasPasskeyObject](../../models/components/schemaspasskeyobject.md)     | :heavy_check_mark:                                                                     | String representing the object's type. Objects of the same type share the same value.<br/> |
| `name`                                                                                 | *string*                                                                               | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `lastUsedAt`                                                                           | *number*                                                                               | :heavy_check_mark:                                                                     | Unix timestamp of when the passkey was last used.<br/>                                 |
| `verification`                                                                         | *components.SchemasPasskeyVerification*                                                | :heavy_check_mark:                                                                     | N/A                                                                                    |