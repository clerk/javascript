# InstanceSettings

InstanceSettings Server API

## Example Usage

```typescript
import { InstanceSettings } from '@clerk/backend-sdk/models/components';

let value: InstanceSettings = {};
```

## Fields

| Field                         | Type                                                                                   | Required           | Description                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------- |
| `object`                      | [components.InstanceSettingsObject](../../models/components/instancesettingsobject.md) | :heavy_minus_sign: | String representing the object's type. Objects of the same type share the same value. |
| `id`                          | _string_                                                                               | :heavy_minus_sign: | N/A                                                                                   |
| `restrictedToAllowlist`       | _boolean_                                                                              | :heavy_minus_sign: | N/A                                                                                   |
| `fromEmailAddress`            | _string_                                                                               | :heavy_minus_sign: | N/A                                                                                   |
| `progressiveSignUp`           | _boolean_                                                                              | :heavy_minus_sign: | N/A                                                                                   |
| `enhancedEmailDeliverability` | _boolean_                                                                              | :heavy_minus_sign: | N/A                                                                                   |
