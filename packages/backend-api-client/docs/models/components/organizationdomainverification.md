# OrganizationDomainVerification

Verification details for the domain

## Example Usage

```typescript
import { OrganizationDomainVerification } from "@clerk/backend-api-client/models/components";

let value: OrganizationDomainVerification = {
  status: "unverified",
  strategy: "<value>",
  attempts: 839189,
  expireAt: 237742,
};
```

## Fields

| Field                                                                                      | Type                                                                                       | Required                                                                                   | Description                                                                                |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `status`                                                                                   | [components.OrganizationDomainStatus](../../models/components/organizationdomainstatus.md) | :heavy_check_mark:                                                                         | Status of the verification. It can be `unverified` or `verified`                           |
| `strategy`                                                                                 | *string*                                                                                   | :heavy_check_mark:                                                                         | Name of the strategy used to verify the domain                                             |
| `attempts`                                                                                 | *number*                                                                                   | :heavy_check_mark:                                                                         | How many attempts have been made to verify the domain                                      |
| `expireAt`                                                                                 | *number*                                                                                   | :heavy_check_mark:                                                                         | Unix timestamp of when the verification will expire                                        |