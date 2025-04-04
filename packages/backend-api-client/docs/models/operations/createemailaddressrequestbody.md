# CreateEmailAddressRequestBody

## Example Usage

```typescript
import { CreateEmailAddressRequestBody } from "@clerk/backend-api-client/models/operations";

let value: CreateEmailAddressRequestBody = {
  userId: "<id>",
  emailAddress: "Cydney.Graham32@hotmail.com",
};
```

## Fields

| Field                                                                                                                      | Type                                                                                                                       | Required                                                                                                                   | Description                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `userId`                                                                                                                   | *string*                                                                                                                   | :heavy_check_mark:                                                                                                         | The ID representing the user                                                                                               |
| `emailAddress`                                                                                                             | *string*                                                                                                                   | :heavy_check_mark:                                                                                                         | The new email address. Must adhere to the RFC 5322 specification for email address format.                                 |
| `verified`                                                                                                                 | *boolean*                                                                                                                  | :heavy_minus_sign:                                                                                                         | When created, the email address will be marked as verified.                                                                |
| `primary`                                                                                                                  | *boolean*                                                                                                                  | :heavy_minus_sign:                                                                                                         | Create this email address as the primary email address for the user.<br/>Default: false, unless it is the first email address. |