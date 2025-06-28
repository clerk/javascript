# PhoneNumber

Success

## Example Usage

```typescript
import { PhoneNumber } from "@clerk/backend-api-client/models/components";

let value: PhoneNumber = {
  object: "phone_number",
  phoneNumber: "749-570-5537 x9671",
  reserved: false,
  verification: {
    status: "unverified",
    strategy: "phone_code",
    attempts: 113519,
    expireAt: 242200,
  },
  linkedTo: [
    {
      type: "<value>",
      id: "<id>",
    },
  ],
  createdAt: 255568,
  updatedAt: 956779,
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