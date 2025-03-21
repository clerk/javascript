# Web3Wallet

## Example Usage

```typescript
import { Web3Wallet } from '@clerk/backend-sdk/models/components';

let value: Web3Wallet = {
  object: 'web3_wallet',
  web3Wallet: '<value>',
  verification: {
    status: 'verified',
    strategy: 'admin',
    attempts: 874288,
    expireAt: 293020,
  },
  createdAt: 848944,
  updatedAt: 617877,
};
```

## Fields

| Field          | Type                                                                       | Required           | Description                                                                                |
| -------------- | -------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `id`           | _string_                                                                   | :heavy_minus_sign: | N/A                                                                                        |
| `object`       | [components.Web3WalletObject](../../models/components/web3walletobject.md) | :heavy_check_mark: | String representing the object's type. Objects of the same type share the same value.<br/> |
| `web3Wallet`   | _string_                                                                   | :heavy_check_mark: | N/A                                                                                        |
| `verification` | _components.Web3WalletVerification_                                        | :heavy_check_mark: | N/A                                                                                        |
| `createdAt`    | _number_                                                                   | :heavy_check_mark: | Unix timestamp of creation<br/>                                                            |
| `updatedAt`    | _number_                                                                   | :heavy_check_mark: | Unix timestamp of creation<br/>                                                            |
