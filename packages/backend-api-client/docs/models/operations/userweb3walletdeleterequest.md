# UserWeb3WalletDeleteRequest

## Example Usage

```typescript
import { UserWeb3WalletDeleteRequest } from "@clerk/backend-api-client/models/operations";

let value: UserWeb3WalletDeleteRequest = {
  userId: "<id>",
  web3WalletIdentificationId: "<id>",
};
```

## Fields

| Field                                            | Type                                             | Required                                         | Description                                      |
| ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ |
| `userId`                                         | *string*                                         | :heavy_check_mark:                               | The ID of the user that owns the web3 wallet     |
| `web3WalletIdentificationId`                     | *string*                                         | :heavy_check_mark:                               | The ID of the web3 wallet identity to be deleted |