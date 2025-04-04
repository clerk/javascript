# OTPVerificationStrategy

## Example Usage

```typescript
import { OTPVerificationStrategy } from "@clerk/backend-api-client/models/components";

let value: OTPVerificationStrategy = "email_code";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"phone_code" | "email_code" | "reset_password_email_code" | Unrecognized<string>
```