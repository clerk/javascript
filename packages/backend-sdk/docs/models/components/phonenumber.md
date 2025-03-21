# PhoneNumber

Success

## Example Usage

```typescript
import { PhoneNumber } from '@clerk/backend-sdk/models/components';

let value: PhoneNumber = {
  object: 'phone_number',
  phoneNumber: '432.397.4220 x4363',
  reserved: false,
  verification: {
    status: 'unverified',
    strategy: 'phone_code',
    attempts: 679393,
    expireAt: 453697,
  },
  linkedTo: [
    {
      type: '<value>',
      id: '<id>',
    },
  ],
  createdAt: 536579,
  updatedAt: 896672,
};
```

## Fields

| Field                     | Type                                                                             | Required           | Description                                                                                |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `id`                      | _string_                                                                         | :heavy_minus_sign: | N/A                                                                                        |
| `object`                  | [components.PhoneNumberObject](../../models/components/phonenumberobject.md)     | :heavy_check_mark: | String representing the object's type. Objects of the same type share the same value.<br/> |
| `phoneNumber`             | _string_                                                                         | :heavy_check_mark: | N/A                                                                                        |
| `reservedForSecondFactor` | _boolean_                                                                        | :heavy_minus_sign: | N/A                                                                                        |
| `defaultSecondFactor`     | _boolean_                                                                        | :heavy_minus_sign: | N/A                                                                                        |
| `reserved`                | _boolean_                                                                        | :heavy_check_mark: | N/A                                                                                        |
| `verification`            | _components.PhoneNumberVerification_                                             | :heavy_check_mark: | N/A                                                                                        |
| `linkedTo`                | [components.IdentificationLink](../../models/components/identificationlink.md)[] | :heavy_check_mark: | N/A                                                                                        |
| `backupCodes`             | _string_[]                                                                       | :heavy_minus_sign: | N/A                                                                                        |
| `createdAt`               | _number_                                                                         | :heavy_check_mark: | Unix timestamp of creation<br/>                                                            |
| `updatedAt`               | _number_                                                                         | :heavy_check_mark: | Unix timestamp of creation<br/>                                                            |
