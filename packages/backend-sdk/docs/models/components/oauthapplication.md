# OAuthApplication

## Example Usage

```typescript
import { OAuthApplication } from '@clerk/backend-sdk/models/components';

let value: OAuthApplication = {
  object: 'oauth_application',
  id: '<id>',
  instanceId: '<id>',
  name: '<value>',
  clientId: '<id>',
  public: false,
  scopes: '<value>',
  redirectUris: ['<value>'],
  callbackUrl: 'https://clean-minority.net/',
  authorizeUrl: 'https://weekly-abacus.name',
  tokenFetchUrl: 'https://oval-vestment.com',
  userInfoUrl: 'https://stylish-language.info',
  discoveryUrl: 'https://busy-hutch.name',
  tokenIntrospectionUrl: 'https://broken-deduction.info',
  createdAt: 623295,
  updatedAt: 886961,
};
```

## Fields

| Field                   | Type                                                                                   | Required           | Description                                                                                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `object`                | [components.OAuthApplicationObject](../../models/components/oauthapplicationobject.md) | :heavy_check_mark: | N/A                                                                                                                                                                          |
| `id`                    | _string_                                                                               | :heavy_check_mark: | N/A                                                                                                                                                                          |
| `instanceId`            | _string_                                                                               | :heavy_check_mark: | N/A                                                                                                                                                                          |
| `name`                  | _string_                                                                               | :heavy_check_mark: | N/A                                                                                                                                                                          |
| `clientId`              | _string_                                                                               | :heavy_check_mark: | N/A                                                                                                                                                                          |
| `public`                | _boolean_                                                                              | :heavy_check_mark: | N/A                                                                                                                                                                          |
| `scopes`                | _string_                                                                               | :heavy_check_mark: | N/A                                                                                                                                                                          |
| `redirectUris`          | _string_[]                                                                             | :heavy_check_mark: | N/A                                                                                                                                                                          |
| ~~`callbackUrl`~~       | _string_                                                                               | :heavy_check_mark: | : warning: ** DEPRECATED **: This will be removed in a future release, please migrate away from it as soon as possible.<br/><br/>Deprecated: Use redirect_uris instead.<br/> |
| `authorizeUrl`          | _string_                                                                               | :heavy_check_mark: | N/A                                                                                                                                                                          |
| `tokenFetchUrl`         | _string_                                                                               | :heavy_check_mark: | N/A                                                                                                                                                                          |
| `userInfoUrl`           | _string_                                                                               | :heavy_check_mark: | N/A                                                                                                                                                                          |
| `discoveryUrl`          | _string_                                                                               | :heavy_check_mark: | N/A                                                                                                                                                                          |
| `tokenIntrospectionUrl` | _string_                                                                               | :heavy_check_mark: | N/A                                                                                                                                                                          |
| `createdAt`             | _number_                                                                               | :heavy_check_mark: | Unix timestamp of creation.<br/>                                                                                                                                             |
| `updatedAt`             | _number_                                                                               | :heavy_check_mark: | Unix timestamp of last update.<br/>                                                                                                                                          |
