# Domain

## Example Usage

```typescript
import { Domain } from '@clerk/backend-sdk/models/components';

let value: Domain = {
  object: 'domain',
  id: '<id>',
  name: '<value>',
  isSatellite: false,
  frontendApiUrl: 'https://important-travel.com/',
  developmentOrigin: '<value>',
};
```

## Fields

| Field               | Type                                                               | Required           | Description                      |
| ------------------- | ------------------------------------------------------------------ | ------------------ | -------------------------------- |
| `object`            | [components.DomainObject](../../models/components/domainobject.md) | :heavy_check_mark: | N/A                              |
| `id`                | _string_                                                           | :heavy_check_mark: | N/A                              |
| `name`              | _string_                                                           | :heavy_check_mark: | N/A                              |
| `isSatellite`       | _boolean_                                                          | :heavy_check_mark: | N/A                              |
| `frontendApiUrl`    | _string_                                                           | :heavy_check_mark: | N/A                              |
| `accountsPortalUrl` | _string_                                                           | :heavy_minus_sign: | Null for satellite domains.<br/> |
| `proxyUrl`          | _string_                                                           | :heavy_minus_sign: | N/A                              |
| `developmentOrigin` | _string_                                                           | :heavy_check_mark: | N/A                              |
| `cnameTargets`      | [components.CNameTarget](../../models/components/cnametarget.md)[] | :heavy_minus_sign: | N/A                              |
