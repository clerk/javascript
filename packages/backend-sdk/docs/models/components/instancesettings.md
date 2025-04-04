# InstanceSettings

InstanceSettings Server API

## Example Usage

```typescript
import { InstanceSettings } from "@clerk/backend-sdk/models/components";

let value: InstanceSettings = {};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `object`                                                                               | [components.InstanceSettingsObject](../../models/components/instancesettingsobject.md) | :heavy_minus_sign:                                                                     | String representing the object's type. Objects of the same type share the same value.  |
| `id`                                                                                   | *string*                                                                               | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `restrictedToAllowlist`                                                                | *boolean*                                                                              | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `fromEmailAddress`                                                                     | *string*                                                                               | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `progressiveSignUp`                                                                    | *boolean*                                                                              | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `enhancedEmailDeliverability`                                                          | *boolean*                                                                              | :heavy_minus_sign:                                                                     | N/A                                                                                    |