# UpdateSignUpRequestBody

## Example Usage

```typescript
import { UpdateSignUpRequestBody } from '@clerk/backend-sdk/models/operations';

let value: UpdateSignUpRequestBody = {};
```

## Fields

| Field          | Type      | Required           | Description                                                                                                                                                                                       |
| -------------- | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `externalId`   | _string_  | :heavy_minus_sign: | The ID of the guest attempting to sign up as used in your external systems or your previous authentication solution.<br/>This will be copied to the resulting user when the sign-up is completed. |
| `customAction` | _boolean_ | :heavy_minus_sign: | If true, the sign-up will be marked as a custom action.                                                                                                                                           |
