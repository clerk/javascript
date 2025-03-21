# RedirectURL

List of Redirect URLs

## Example Usage

```typescript
import { RedirectURL } from '@clerk/backend-sdk/models/components';

let value: RedirectURL = {
  object: 'redirect_url',
  id: '<id>',
  url: 'https://simplistic-descendant.biz/',
  createdAt: 449292,
  updatedAt: 304468,
};
```

## Fields

| Field       | Type                                                                         | Required           | Description                         |
| ----------- | ---------------------------------------------------------------------------- | ------------------ | ----------------------------------- |
| `object`    | [components.RedirectURLObject](../../models/components/redirecturlobject.md) | :heavy_check_mark: | N/A                                 |
| `id`        | _string_                                                                     | :heavy_check_mark: | N/A                                 |
| `url`       | _string_                                                                     | :heavy_check_mark: | N/A                                 |
| `createdAt` | _number_                                                                     | :heavy_check_mark: | Unix timestamp of creation.<br/>    |
| `updatedAt` | _number_                                                                     | :heavy_check_mark: | Unix timestamp of last update.<br/> |
