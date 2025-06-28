# AllowlistIdentifier

Success

## Example Usage

```typescript
import { AllowlistIdentifier } from "@clerk/backend-api-client/models/components";

let value: AllowlistIdentifier = {};
```

## Fields

| Field                                                                                        | Type                                                                                         | Required                                                                                     | Description                                                                                  |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `object`                                                                                     | [components.AllowlistIdentifierObject](../../models/components/allowlistidentifierobject.md) | :heavy_minus_sign:                                                                           | String representing the object's type. Objects of the same type share the same value.<br/>   |
| `id`                                                                                         | *string*                                                                                     | :heavy_minus_sign:                                                                           | N/A                                                                                          |
| `invitationId`                                                                               | *string*                                                                                     | :heavy_minus_sign:                                                                           | N/A                                                                                          |
| `identifier`                                                                                 | *string*                                                                                     | :heavy_minus_sign:                                                                           | An email address or a phone number.<br/>                                                     |
| `identifierType`                                                                             | [components.IdentifierType](../../models/components/identifiertype.md)                       | :heavy_minus_sign:                                                                           | N/A                                                                                          |
| `instanceId`                                                                                 | *string*                                                                                     | :heavy_minus_sign:                                                                           | N/A                                                                                          |
| `createdAt`                                                                                  | *number*                                                                                     | :heavy_minus_sign:                                                                           | Unix timestamp of creation<br/>                                                              |
| `updatedAt`                                                                                  | *number*                                                                                     | :heavy_minus_sign:                                                                           | Unix timestamp of last update.<br/>                                                          |