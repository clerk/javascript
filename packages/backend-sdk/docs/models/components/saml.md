# Saml

## Example Usage

```typescript
import { Saml } from '@clerk/backend-sdk/models/components';

let value: Saml = {
  status: 'expired',
  strategy: 'saml',
  externalVerificationRedirectUrl: 'https://ideal-mortise.net/',
  expireAt: 628982,
  attempts: 872651,
};
```

## Fields

| Field                             | Type                                                                                       | Required           | Description |
| --------------------------------- | ------------------------------------------------------------------------------------------ | ------------------ | ----------- |
| `status`                          | [components.SAMLVerificationStatus](../../models/components/samlverificationstatus.md)     | :heavy_check_mark: | N/A         |
| `strategy`                        | [components.SAMLVerificationStrategy](../../models/components/samlverificationstrategy.md) | :heavy_check_mark: | N/A         |
| `externalVerificationRedirectUrl` | _string_                                                                                   | :heavy_check_mark: | N/A         |
| `error`                           | _components.VerificationError_                                                             | :heavy_minus_sign: | N/A         |
| `expireAt`                        | _number_                                                                                   | :heavy_check_mark: | N/A         |
| `attempts`                        | _number_                                                                                   | :heavy_check_mark: | N/A         |
| `verifiedAtClient`                | _string_                                                                                   | :heavy_minus_sign: | N/A         |
