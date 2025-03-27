# SignUpVerifications

## Example Usage

```typescript
import { SignUpVerifications } from "@clerk/backend-sdk/models/components";

let value: SignUpVerifications = {
  emailAddress: {},
  phoneNumber: {},
  web3Wallet: {},
  externalAccount: {},
};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `emailAddress`                                                                 | [components.SignUpVerification](../../models/components/signupverification.md) | :heavy_check_mark:                                                             | N/A                                                                            |
| `phoneNumber`                                                                  | [components.SignUpVerification](../../models/components/signupverification.md) | :heavy_check_mark:                                                             | N/A                                                                            |
| `web3Wallet`                                                                   | [components.SignUpVerification](../../models/components/signupverification.md) | :heavy_check_mark:                                                             | N/A                                                                            |
| `externalAccount`                                                              | [components.ExternalAccount](../../models/components/externalaccount.md)       | :heavy_check_mark:                                                             | N/A                                                                            |