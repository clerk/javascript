# VerifyTOTPResponseBody

The provided TOTP or backup code was correct.

## Example Usage

```typescript
import { VerifyTOTPResponseBody } from '@clerk/backend-sdk/models/operations';

let value: VerifyTOTPResponseBody = {};
```

## Fields

| Field      | Type                                                       | Required           | Description |
| ---------- | ---------------------------------------------------------- | ------------------ | ----------- |
| `verified` | _boolean_                                                  | :heavy_minus_sign: | N/A         |
| `codeType` | [operations.CodeType](../../models/operations/codetype.md) | :heavy_minus_sign: | N/A         |
