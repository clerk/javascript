# GetPublicInterstitialRequest

## Example Usage

```typescript
import { GetPublicInterstitialRequest } from '@clerk/backend-sdk/models/operations';

let value: GetPublicInterstitialRequest = {};
```

## Fields

| Field                           | Type      | Required           | Description                                                                                                                                                        |
| ------------------------------- | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ~~`frontendApiQueryParameter`~~ | _string_  | :heavy_minus_sign: | : warning: ** DEPRECATED **: This will be removed in a future release, please migrate away from it as soon as possible.<br/><br/>Please use `frontend_api` instead |
| `frontendApiQueryParameter1`    | _string_  | :heavy_minus_sign: | The Frontend API key of your instance                                                                                                                              |
| `publishableKey`                | _string_  | :heavy_minus_sign: | The publishable key of your instance                                                                                                                               |
| `proxyUrl`                      | _string_  | :heavy_minus_sign: | The proxy URL of your instance                                                                                                                                     |
| `domain`                        | _string_  | :heavy_minus_sign: | The domain of your instance                                                                                                                                        |
| `signInUrl`                     | _string_  | :heavy_minus_sign: | The sign in URL of your instance                                                                                                                                   |
| `useDomainForScript`            | _boolean_ | :heavy_minus_sign: | Whether to use the domain for the script URL                                                                                                                       |
