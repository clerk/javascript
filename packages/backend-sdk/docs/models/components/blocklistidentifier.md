# BlocklistIdentifier

## Example Usage

```typescript
import { BlocklistIdentifier } from '@clerk/backend-sdk/models/components';

let value: BlocklistIdentifier = {};
```

## Fields

| Field            | Type                                                                                                         | Required           | Description                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------ |
| `object`         | [components.BlocklistIdentifierObject](../../models/components/blocklistidentifierobject.md)                 | :heavy_minus_sign: | String representing the object's type. Objects of the same type share the same value.<br/> |
| `id`             | _string_                                                                                                     | :heavy_minus_sign: | N/A                                                                                        |
| `identifier`     | _string_                                                                                                     | :heavy_minus_sign: | An email address, email domain, phone number or web3 wallet.<br/>                          |
| `identifierType` | [components.BlocklistIdentifierIdentifierType](../../models/components/blocklistidentifieridentifiertype.md) | :heavy_minus_sign: | N/A                                                                                        |
| `instanceId`     | _string_                                                                                                     | :heavy_minus_sign: | N/A                                                                                        |
| `createdAt`      | _number_                                                                                                     | :heavy_minus_sign: | Unix timestamp of creation<br/>                                                            |
| `updatedAt`      | _number_                                                                                                     | :heavy_minus_sign: | Unix timestamp of last update.<br/>                                                        |
