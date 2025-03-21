# AddDomainRequestBody

## Example Usage

```typescript
import { AddDomainRequestBody } from '@clerk/backend-sdk/models/operations';

let value: AddDomainRequestBody = {
  name: '<value>',
  isSatellite: false,
};
```

## Fields

| Field         | Type      | Required           | Description                                                                                                                               |
| ------------- | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | _string_  | :heavy_check_mark: | The new domain name. Can contain the port for development instances.                                                                      |
| `isSatellite` | _boolean_ | :heavy_check_mark: | Marks the new domain as satellite. Only `true` is accepted at the moment.                                                                 |
| `proxyUrl`    | _string_  | :heavy_minus_sign: | The full URL of the proxy which will forward requests to the Clerk Frontend API for this domain. Applicable only to production instances. |
