# Web3Signature

## Example Usage

```typescript
import { Web3Signature } from "@clerk/backend-sdk/models/components";

let value: Web3Signature = {
  status: "expired",
  strategy: "web3_okx_wallet_signature",
  attempts: 333145,
  expireAt: 81101,
};
```

## Fields

| Field                                                                                                        | Type                                                                                                         | Required                                                                                                     | Description                                                                                                  |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `status`                                                                                                     | [components.Web3SignatureVerificationStatus](../../models/components/web3signatureverificationstatus.md)     | :heavy_check_mark:                                                                                           | N/A                                                                                                          |
| `strategy`                                                                                                   | [components.Web3SignatureVerificationStrategy](../../models/components/web3signatureverificationstrategy.md) | :heavy_check_mark:                                                                                           | N/A                                                                                                          |
| `nonce`                                                                                                      | *string*                                                                                                     | :heavy_minus_sign:                                                                                           | N/A                                                                                                          |
| `message`                                                                                                    | *string*                                                                                                     | :heavy_minus_sign:                                                                                           | N/A                                                                                                          |
| `attempts`                                                                                                   | *number*                                                                                                     | :heavy_check_mark:                                                                                           | N/A                                                                                                          |
| `expireAt`                                                                                                   | *number*                                                                                                     | :heavy_check_mark:                                                                                           | N/A                                                                                                          |
| `verifiedAtClient`                                                                                           | *string*                                                                                                     | :heavy_minus_sign:                                                                                           | N/A                                                                                                          |