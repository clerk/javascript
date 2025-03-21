# Actor

The actor payload. It needs to include a sub property which should contain the ID of the actor.
This whole payload will be also included in the JWT session token.

## Example Usage

```typescript
import { Actor } from '@clerk/backend-sdk/models/operations';

let value: Actor = {
  sub: 'user_2OEpKhcCN1Lat9NQ0G6puh7q5Rb',
};
```

## Fields

| Field                  | Type                  | Required           | Description          | Example                                               |
| ---------------------- | --------------------- | ------------------ | -------------------- | ----------------------------------------------------- |
| `sub`                  | _string_              | :heavy_check_mark: | The ID of the actor. |                                                       |
| `additionalProperties` | Record<string, _any_> | :heavy_minus_sign: | N/A                  | {<br/>"sub": "user_2OEpKhcCN1Lat9NQ0G6puh7q5Rb"<br/>} |
