# OAuthApplications

A list of OAuth applications

## Example Usage

```typescript
import { OAuthApplications } from '@clerk/backend-sdk/models/components';

let value: OAuthApplications = {
  data: [
    {
      object: 'oauth_application',
      id: '<id>',
      instanceId: '<id>',
      name: '<value>',
      clientId: '<id>',
      public: false,
      scopes: '<value>',
      redirectUris: ['<value>'],
      callbackUrl: 'https://fair-hydrolyze.com/',
      authorizeUrl: 'https://shrill-platypus.name/',
      tokenFetchUrl: 'https://downright-flight.net',
      userInfoUrl: 'https://neat-ecliptic.com',
      discoveryUrl: 'https://acidic-gastropod.name',
      tokenIntrospectionUrl: 'https://brisk-haircut.com',
      createdAt: 342611,
      updatedAt: 622231,
    },
  ],
  totalCount: 279068,
};
```

## Fields

| Field        | Type                                                                         | Required           | Description                             |
| ------------ | ---------------------------------------------------------------------------- | ------------------ | --------------------------------------- |
| `data`       | [components.OAuthApplication](../../models/components/oauthapplication.md)[] | :heavy_check_mark: | N/A                                     |
| `totalCount` | _number_                                                                     | :heavy_check_mark: | Total number of OAuth applications<br/> |
