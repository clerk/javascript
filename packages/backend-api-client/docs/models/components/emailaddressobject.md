# EmailAddressObject

String representing the object's type. Objects of the same type share the same value.


## Example Usage

```typescript
import { EmailAddressObject } from "@clerk/backend-api-client/models/components";

let value: EmailAddressObject = "email_address";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"email_address" | Unrecognized<string>
```