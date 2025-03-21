# AllowlistIdentifier

Success

## Example Usage

```typescript
import { AllowlistIdentifier } from '@clerk/backend-sdk/models/components';

let value: AllowlistIdentifier = {};
```

## Fields

| Field            | Type                                                                                         | Required           | Description                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `object`         | [components.AllowlistIdentifierObject](../../models/components/allowlistidentifierobject.md) | :heavy_minus_sign: | String representing the object's type. Objects of the same type share the same value.<br/> |
| `id`             | _string_                                                                                     | :heavy_minus_sign: | N/A                                                                                        |
| `invitationId`   | _string_                                                                                     | :heavy_minus_sign: | N/A                                                                                        |
| `identifier`     | _string_                                                                                     | :heavy_minus_sign: | An email address or a phone number.<br/>                                                   |
| `identifierType` | [components.IdentifierType](../../models/components/identifiertype.md)                       | :heavy_minus_sign: | N/A                                                                                        |
| `instanceId`     | _string_                                                                                     | :heavy_minus_sign: | N/A                                                                                        |
| `createdAt`      | _number_                                                                                     | :heavy_minus_sign: | Unix timestamp of creation<br/>                                                            |
| `updatedAt`      | _number_                                                                                     | :heavy_minus_sign: | Unix timestamp of last update.<br/>                                                        |
