# OAuthApplications

A list of OAuth applications

## Example Usage

```typescript
import { OAuthApplications } from "@clerk/backend-api-client/models/components";

let value: OAuthApplications = {
  data: [
    {
      object: "oauth_application",
      id: "<id>",
      instanceId: "<id>",
      name: "<value>",
      clientId: "<id>",
      public: false,
      scopes: "<value>",
      redirectUris: [
        "<value>",
      ],
      callbackUrl: "https://acceptable-passport.name",
      authorizeUrl: "https://white-adviser.net",
      tokenFetchUrl: "https://memorable-finger.net",
      userInfoUrl: "https://judicious-legging.net/",
      discoveryUrl: "https://enchanted-handle.name/",
      tokenIntrospectionUrl: "https://polished-certification.org",
      createdAt: 871786,
      updatedAt: 502721,
    },
  ],
  totalCount: 922348,
};
```

## Fields

| Field                                                                        | Type                                                                         | Required                                                                     | Description                                                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `data`                                                                       | [components.OAuthApplication](../../models/components/oauthapplication.md)[] | :heavy_check_mark:                                                           | N/A                                                                          |
| `totalCount`                                                                 | *number*                                                                     | :heavy_check_mark:                                                           | Total number of OAuth applications<br/>                                      |