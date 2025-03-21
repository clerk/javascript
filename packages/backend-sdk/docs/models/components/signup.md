# SignUp

Success

## Example Usage

```typescript
import { SignUp } from '@clerk/backend-sdk/models/components';

let value: SignUp = {
  object: 'sign_up_attempt',
  id: '<id>',
  status: 'abandoned',
  requiredFields: ['<value>'],
  optionalFields: ['<value>'],
  missingFields: ['<value>'],
  unverifiedFields: ['<value>'],
  verifications: {
    emailAddress: {},
    phoneNumber: {},
    web3Wallet: {},
    externalAccount: {},
  },
  username: 'Tristian_Price',
  emailAddress: 'Elbert.Johnson@gmail.com',
  phoneNumber: '1-952-684-5244 x25335',
  web3Wallet: '<value>',
  passwordEnabled: false,
  firstName: 'Nestor',
  lastName: 'Walsh',
  customAction: false,
  externalId: '<id>',
  createdSessionId: '<id>',
  createdUserId: '<id>',
  abandonAt: 1700690400000,
  legalAcceptedAt: 1700690400000,
};
```

## Fields

| Field                 | Type                                                                                 | Required           | Description                                                                                                             | Example       |
| --------------------- | ------------------------------------------------------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------- |
| `object`              | [components.SignUpObject](../../models/components/signupobject.md)                   | :heavy_check_mark: | N/A                                                                                                                     |               |
| `id`                  | _string_                                                                             | :heavy_check_mark: | N/A                                                                                                                     |               |
| `status`              | [components.SignUpStatus](../../models/components/signupstatus.md)                   | :heavy_check_mark: | N/A                                                                                                                     |               |
| `requiredFields`      | _string_[]                                                                           | :heavy_check_mark: | N/A                                                                                                                     |               |
| `optionalFields`      | _string_[]                                                                           | :heavy_check_mark: | N/A                                                                                                                     |               |
| `missingFields`       | _string_[]                                                                           | :heavy_check_mark: | N/A                                                                                                                     |               |
| `unverifiedFields`    | _string_[]                                                                           | :heavy_check_mark: | N/A                                                                                                                     |               |
| `verifications`       | [components.SignUpVerifications](../../models/components/signupverifications.md)     | :heavy_check_mark: | N/A                                                                                                                     |               |
| `username`            | _string_                                                                             | :heavy_check_mark: | N/A                                                                                                                     |               |
| `emailAddress`        | _string_                                                                             | :heavy_check_mark: | N/A                                                                                                                     |               |
| `phoneNumber`         | _string_                                                                             | :heavy_check_mark: | N/A                                                                                                                     |               |
| `web3Wallet`          | _string_                                                                             | :heavy_check_mark: | N/A                                                                                                                     |               |
| `passwordEnabled`     | _boolean_                                                                            | :heavy_check_mark: | N/A                                                                                                                     |               |
| `firstName`           | _string_                                                                             | :heavy_check_mark: | N/A                                                                                                                     |               |
| `lastName`            | _string_                                                                             | :heavy_check_mark: | N/A                                                                                                                     |               |
| `unsafeMetadata`      | Record<string, _any_>                                                                | :heavy_minus_sign: | N/A                                                                                                                     |               |
| `publicMetadata`      | Record<string, _any_>                                                                | :heavy_minus_sign: | N/A                                                                                                                     |               |
| `customAction`        | _boolean_                                                                            | :heavy_check_mark: | N/A                                                                                                                     |               |
| `externalId`          | _string_                                                                             | :heavy_check_mark: | N/A                                                                                                                     |               |
| `createdSessionId`    | _string_                                                                             | :heavy_check_mark: | N/A                                                                                                                     |               |
| `createdUserId`       | _string_                                                                             | :heavy_check_mark: | N/A                                                                                                                     |               |
| `abandonAt`           | _number_                                                                             | :heavy_check_mark: | Unix timestamp at which the user abandoned the sign up attempt.<br/>                                                    | 1700690400000 |
| `legalAcceptedAt`     | _number_                                                                             | :heavy_check_mark: | Unix timestamp at which the user accepted the legal requirements.<br/>                                                  | 1700690400000 |
| ~~`externalAccount`~~ | [components.SignUpExternalAccount](../../models/components/signupexternalaccount.md) | :heavy_minus_sign: | : warning: ** DEPRECATED **: This will be removed in a future release, please migrate away from it as soon as possible. |               |
