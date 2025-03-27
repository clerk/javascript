# InstanceRestrictions

Success

## Example Usage

```typescript
import { InstanceRestrictions } from "@clerk/backend-sdk/models/components";

let value: InstanceRestrictions = {
  object: "instance_restrictions",
  allowlist: false,
  blocklist: false,
  blockEmailSubaddresses: false,
  blockDisposableEmailDomains: false,
  ignoreDotsForGmailAddresses: false,
};
```

## Fields

| Field                                                                                          | Type                                                                                           | Required                                                                                       | Description                                                                                    |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `object`                                                                                       | [components.InstanceRestrictionsObject](../../models/components/instancerestrictionsobject.md) | :heavy_check_mark:                                                                             | String representing the object's type. Objects of the same type share the same value.          |
| `allowlist`                                                                                    | *boolean*                                                                                      | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `blocklist`                                                                                    | *boolean*                                                                                      | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `blockEmailSubaddresses`                                                                       | *boolean*                                                                                      | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `blockDisposableEmailDomains`                                                                  | *boolean*                                                                                      | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `ignoreDotsForGmailAddresses`                                                                  | *boolean*                                                                                      | :heavy_check_mark:                                                                             | N/A                                                                                            |