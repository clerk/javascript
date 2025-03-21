# PreviewTemplateRequestBody

Required parameters

## Example Usage

```typescript
import { PreviewTemplateRequestBody } from '@clerk/backend-sdk/models/operations';

let value: PreviewTemplateRequestBody = {};
```

## Fields

| Field              | Type     | Required           | Description                                                                                                                                                                                        |
| ------------------ | -------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `subject`          | _string_ | :heavy_minus_sign: | The email subject.<br/>Applicable only to email templates.                                                                                                                                         |
| `body`             | _string_ | :heavy_minus_sign: | The template body before variable interpolation                                                                                                                                                    |
| `fromEmailName`    | _string_ | :heavy_minus_sign: | The local part of the From email address that will be used for emails.<br/>For example, in the address 'hello@example.com', the local part is 'hello'.<br/>Applicable only to email templates.     |
| `replyToEmailName` | _string_ | :heavy_minus_sign: | The local part of the Reply To email address that will be used for emails.<br/>For example, in the address 'hello@example.com', the local part is 'hello'.<br/>Applicable only to email templates. |
