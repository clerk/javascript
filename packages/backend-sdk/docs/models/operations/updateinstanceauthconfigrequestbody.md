# UpdateInstanceAuthConfigRequestBody

## Example Usage

```typescript
import { UpdateInstanceAuthConfigRequestBody } from '@clerk/backend-sdk/models/operations';

let value: UpdateInstanceAuthConfigRequestBody = {};
```

## Fields

| Field                         | Type      | Required           | Description                                                                                                                                                                                                                                                                      |
| ----------------------------- | --------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `restrictedToAllowlist`       | _boolean_ | :heavy_minus_sign: | Whether sign up is restricted to email addresses, phone numbers and usernames that are on the allowlist.                                                                                                                                                                         |
| `fromEmailAddress`            | _string_  | :heavy_minus_sign: | The local part of the email address from which authentication-related emails (e.g. OTP code, magic links) will be sent.<br/>Only alphanumeric values are allowed.<br/>Note that this value should contain only the local part of the address (e.g. `foo` for `foo@example.com`). |
| `progressiveSignUp`           | _boolean_ | :heavy_minus_sign: | Enable the Progressive Sign Up algorithm. Refer to the [docs](https://clerk.com/docs/upgrade-guides/progressive-sign-up) for more info.                                                                                                                                          |
| `enhancedEmailDeliverability` | _boolean_ | :heavy_minus_sign: | The "enhanced_email_deliverability" feature will send emails from "verifications@clerk.dev" instead of your domain.<br/>This can be helpful if you do not have a high domain reputation.                                                                                         |
| `testMode`                    | _boolean_ | :heavy_minus_sign: | Toggles test mode for this instance, allowing the use of test email addresses and phone numbers.<br/>Defaults to true for development instances.                                                                                                                                 |
