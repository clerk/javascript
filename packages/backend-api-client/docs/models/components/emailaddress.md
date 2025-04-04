# EmailAddress

Success

## Example Usage

```typescript
import { EmailAddress } from "@clerk/backend-api-client/models/components";

let value: EmailAddress = {
  object: "email_address",
  emailAddress: "Arlo_Sanford75@gmail.com",
  reserved: false,
  verification: {
    status: "failed",
    strategy: "email_code",
    attempts: 511846,
    expireAt: 482550,
  },
  linkedTo: [
    {
      type: "<value>",
      id: "<id>",
    },
  ],
  createdAt: 887530,
  updatedAt: 135881,
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `id`                                                                                   | *string*                                                                               | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `object`                                                                               | [components.EmailAddressObject](../../models/components/emailaddressobject.md)         | :heavy_check_mark:                                                                     | String representing the object's type. Objects of the same type share the same value.<br/> |
| `emailAddress`                                                                         | *string*                                                                               | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `reserved`                                                                             | *boolean*                                                                              | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `verification`                                                                         | *components.Verification*                                                              | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `linkedTo`                                                                             | [components.IdentificationLink](../../models/components/identificationlink.md)[]       | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `matchesSsoConnection`                                                                 | *boolean*                                                                              | :heavy_minus_sign:                                                                     | Indicates whether this email address domain matches an active enterprise connection.<br/> |
| `createdAt`                                                                            | *number*                                                                               | :heavy_check_mark:                                                                     | Unix timestamp of creation<br/>                                                        |
| `updatedAt`                                                                            | *number*                                                                               | :heavy_check_mark:                                                                     | Unix timestamp of creation<br/>                                                        |