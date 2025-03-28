# PhoneNumber

Success

## Example Usage

```typescript
import { PhoneNumber } from "@clerk/backend-sdk/models/components";

let value: PhoneNumber = {
  object: "phone_number",
  phoneNumber: "432.397.4220 x4363",
  reserved: false,
  verification: {
    status: "unverified",
    strategy: "phone_code",
    attempts: 679393,
    expireAt: 453697,
  },
  linkedTo: [
    {
      type: "<value>",
      id: "<id>",
    },
  ],
  createdAt: 536579,
  updatedAt: 896672,
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `id`                                                                                   | *string*                                                                               | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `object`                                                                               | [components.PhoneNumberObject](../../models/components/phonenumberobject.md)           | :heavy_check_mark:                                                                     | String representing the object's type. Objects of the same type share the same value.<br/> |
| `phoneNumber`                                                                          | *string*                                                                               | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `reservedForSecondFactor`                                                              | *boolean*                                                                              | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `defaultSecondFactor`                                                                  | *boolean*                                                                              | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `reserved`                                                                             | *boolean*                                                                              | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `verification`                                                                         | *components.PhoneNumberVerification*                                                   | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `linkedTo`                                                                             | [components.IdentificationLink](../../models/components/identificationlink.md)[]       | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `backupCodes`                                                                          | *string*[]                                                                             | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `createdAt`                                                                            | *number*                                                                               | :heavy_check_mark:                                                                     | Unix timestamp of creation<br/>                                                        |
| `updatedAt`                                                                            | *number*                                                                               | :heavy_check_mark:                                                                     | Unix timestamp of creation<br/>                                                        |