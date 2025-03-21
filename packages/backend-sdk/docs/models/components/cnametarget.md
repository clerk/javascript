# CNameTarget

## Example Usage

```typescript
import { CNameTarget } from '@clerk/backend-sdk/models/components';

let value: CNameTarget = {
  host: 'weary-summer.info',
  value: '<value>',
  required: false,
};
```

## Fields

| Field      | Type      | Required           | Description                                                                                                     |
| ---------- | --------- | ------------------ | --------------------------------------------------------------------------------------------------------------- |
| `host`     | _string_  | :heavy_check_mark: | N/A                                                                                                             |
| `value`    | _string_  | :heavy_check_mark: | N/A                                                                                                             |
| `required` | _boolean_ | :heavy_check_mark: | Denotes whether this CNAME target is required to be set in order for the domain to be considered deployed.<br/> |
