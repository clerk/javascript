# OrganizationDomainVerification

Verification details for the domain

## Example Usage

```typescript
import { OrganizationDomainVerification } from '@clerk/backend-sdk/models/components';

let value: OrganizationDomainVerification = {
  status: 'unverified',
  strategy: '<value>',
  attempts: 554688,
  expireAt: 287051,
};
```

## Fields

| Field      | Type                                                                                       | Required           | Description                                                      |
| ---------- | ------------------------------------------------------------------------------------------ | ------------------ | ---------------------------------------------------------------- |
| `status`   | [components.OrganizationDomainStatus](../../models/components/organizationdomainstatus.md) | :heavy_check_mark: | Status of the verification. It can be `unverified` or `verified` |
| `strategy` | _string_                                                                                   | :heavy_check_mark: | Name of the strategy used to verify the domain                   |
| `attempts` | _number_                                                                                   | :heavy_check_mark: | How many attempts have been made to verify the domain            |
| `expireAt` | _number_                                                                                   | :heavy_check_mark: | Unix timestamp of when the verification will expire              |
