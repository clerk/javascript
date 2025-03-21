# Web3Signature

## Example Usage

```typescript
import { Web3Signature } from '@clerk/backend-sdk/models/components';

let value: Web3Signature = {
  status: 'unverified',
  strategy: 'web3_coinbase_wallet_signature',
  attempts: 977496,
  expireAt: 876506,
};
```

## Fields

| Field              | Type                                                                                                         | Required           | Description |
| ------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------ | ----------- |
| `status`           | [components.Web3SignatureVerificationStatus](../../models/components/web3signatureverificationstatus.md)     | :heavy_check_mark: | N/A         |
| `strategy`         | [components.Web3SignatureVerificationStrategy](../../models/components/web3signatureverificationstrategy.md) | :heavy_check_mark: | N/A         |
| `nonce`            | _string_                                                                                                     | :heavy_minus_sign: | N/A         |
| `message`          | _string_                                                                                                     | :heavy_minus_sign: | N/A         |
| `attempts`         | _number_                                                                                                     | :heavy_check_mark: | N/A         |
| `expireAt`         | _number_                                                                                                     | :heavy_check_mark: | N/A         |
| `verifiedAtClient` | _string_                                                                                                     | :heavy_minus_sign: | N/A         |
