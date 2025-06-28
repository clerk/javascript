# ProxyCheck

Health check information about a domain's proxy configuration validation attempt.

## Example Usage

```typescript
import { ProxyCheck } from "@clerk/backend-api-client/models/components";

let value: ProxyCheck = {
  object: "proxy_check",
  id: "<id>",
  domainId: "<id>",
  lastRunAt: 26588,
  proxyUrl: "https://glossy-issue.org",
  successful: false,
  createdAt: 765207,
  updatedAt: 510204,
};
```

## Fields

| Field                                                                      | Type                                                                       | Required                                                                   | Description                                                                |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `object`                                                                   | [components.ProxyCheckObject](../../models/components/proxycheckobject.md) | :heavy_check_mark:                                                         | N/A                                                                        |
| `id`                                                                       | *string*                                                                   | :heavy_check_mark:                                                         | N/A                                                                        |
| `domainId`                                                                 | *string*                                                                   | :heavy_check_mark:                                                         | N/A                                                                        |
| `lastRunAt`                                                                | *number*                                                                   | :heavy_check_mark:                                                         | Unix timestamp of last run.<br/>                                           |
| `proxyUrl`                                                                 | *string*                                                                   | :heavy_check_mark:                                                         | N/A                                                                        |
| `successful`                                                               | *boolean*                                                                  | :heavy_check_mark:                                                         | N/A                                                                        |
| `createdAt`                                                                | *number*                                                                   | :heavy_check_mark:                                                         | Unix timestamp of creation.<br/>                                           |
| `updatedAt`                                                                | *number*                                                                   | :heavy_check_mark:                                                         | Unix timestamp of last update.<br/>                                        |