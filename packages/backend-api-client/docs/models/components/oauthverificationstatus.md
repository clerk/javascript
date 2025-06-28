# OauthVerificationStatus

## Example Usage

```typescript
import { OauthVerificationStatus } from "@clerk/backend-api-client/models/components";

let value: OauthVerificationStatus = "verified";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"unverified" | "verified" | "failed" | "expired" | "transferable" | Unrecognized<string>
```