# VerifyDomainProxyRequestBody

## Example Usage

```typescript
import { VerifyDomainProxyRequestBody } from "@clerk/backend-api-client/models/operations";

let value: VerifyDomainProxyRequestBody = {};
```

## Fields

| Field                                                                                                                             | Type                                                                                                                              | Required                                                                                                                          | Description                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `domainId`                                                                                                                        | *string*                                                                                                                          | :heavy_minus_sign:                                                                                                                | The ID of the domain that will be updated.                                                                                        |
| `proxyUrl`                                                                                                                        | *string*                                                                                                                          | :heavy_minus_sign:                                                                                                                | The full URL of the proxy which will forward requests to the Clerk Frontend API for this domain. e.g. https://example.com/__clerk |