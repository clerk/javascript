# UpsertTemplateRequestBody

## Example Usage

```typescript
import { UpsertTemplateRequestBody } from '@clerk/backend-sdk/models/operations';

let value: UpsertTemplateRequestBody = {};
```

## Fields

| Field              | Type      | Required           | Description                                                                                                                                                                                        |
| ------------------ | --------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`             | _string_  | :heavy_minus_sign: | The user-friendly name of the template                                                                                                                                                             |
| `subject`          | _string_  | :heavy_minus_sign: | The email subject.<br/>Applicable only to email templates.                                                                                                                                         |
| `markup`           | _string_  | :heavy_minus_sign: | The editor markup used to generate the body of the template                                                                                                                                        |
| `body`             | _string_  | :heavy_minus_sign: | The template body before variable interpolation                                                                                                                                                    |
| `deliveredByClerk` | _boolean_ | :heavy_minus_sign: | Whether Clerk should deliver emails or SMS messages based on the current template                                                                                                                  |
| `fromEmailName`    | _string_  | :heavy_minus_sign: | The local part of the From email address that will be used for emails.<br/>For example, in the address 'hello@example.com', the local part is 'hello'.<br/>Applicable only to email templates.     |
| `replyToEmailName` | _string_  | :heavy_minus_sign: | The local part of the Reply To email address that will be used for emails.<br/>For example, in the address 'hello@example.com', the local part is 'hello'.<br/>Applicable only to email templates. |
