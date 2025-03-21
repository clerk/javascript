# InstanceRestrictions

Success

## Example Usage

```typescript
import { InstanceRestrictions } from '@clerk/backend-sdk/models/components';

let value: InstanceRestrictions = {
  object: 'instance_restrictions',
  allowlist: false,
  blocklist: false,
  blockEmailSubaddresses: false,
  blockDisposableEmailDomains: false,
  ignoreDotsForGmailAddresses: false,
};
```

## Fields

| Field                         | Type                                                                                           | Required           | Description                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------- |
| `object`                      | [components.InstanceRestrictionsObject](../../models/components/instancerestrictionsobject.md) | :heavy_check_mark: | String representing the object's type. Objects of the same type share the same value. |
| `allowlist`                   | _boolean_                                                                                      | :heavy_check_mark: | N/A                                                                                   |
| `blocklist`                   | _boolean_                                                                                      | :heavy_check_mark: | N/A                                                                                   |
| `blockEmailSubaddresses`      | _boolean_                                                                                      | :heavy_check_mark: | N/A                                                                                   |
| `blockDisposableEmailDomains` | _boolean_                                                                                      | :heavy_check_mark: | N/A                                                                                   |
| `ignoreDotsForGmailAddresses` | _boolean_                                                                                      | :heavy_check_mark: | N/A                                                                                   |
