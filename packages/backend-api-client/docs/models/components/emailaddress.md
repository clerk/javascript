# EmailAddress

Success

## Example Usage

```typescript
import { EmailAddress } from "@clerk/backend-api-client/models/components";

let value: EmailAddress = {
  object: "email_address",
  emailAddress: "Mireya_Wolf@yahoo.com",
  reserved: false,
  verification: {
    status: "unverified",
    strategy: "<value>",
    expireAt: 521037,
    attempts: 54338,
  },
  linkedTo: [
    {
      type: "<value>",
      id: "<id>",
    },
  ],
  createdAt: 199996,
  updatedAt: 18521,
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