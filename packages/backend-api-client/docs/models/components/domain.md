# Domain

## Example Usage

```typescript
import { Domain } from "@clerk/backend-api-client/models/components";

let value: Domain = {
  object: "domain",
  id: "<id>",
  name: "<value>",
  isSatellite: false,
  frontendApiUrl: "https://expensive-pick.name",
  developmentOrigin: "<value>",
};
```

## Fields

| Field                                                              | Type                                                               | Required                                                           | Description                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `object`                                                           | [components.DomainObject](../../models/components/domainobject.md) | :heavy_check_mark:                                                 | N/A                                                                |
| `id`                                                               | *string*                                                           | :heavy_check_mark:                                                 | N/A                                                                |
| `name`                                                             | *string*                                                           | :heavy_check_mark:                                                 | N/A                                                                |
| `isSatellite`                                                      | *boolean*                                                          | :heavy_check_mark:                                                 | N/A                                                                |
| `frontendApiUrl`                                                   | *string*                                                           | :heavy_check_mark:                                                 | N/A                                                                |
| `accountsPortalUrl`                                                | *string*                                                           | :heavy_minus_sign:                                                 | Null for satellite domains.<br/>                                   |
| `proxyUrl`                                                         | *string*                                                           | :heavy_minus_sign:                                                 | N/A                                                                |
| `developmentOrigin`                                                | *string*                                                           | :heavy_check_mark:                                                 | N/A                                                                |
| `cnameTargets`                                                     | [components.CNameTarget](../../models/components/cnametarget.md)[] | :heavy_minus_sign:                                                 | N/A                                                                |