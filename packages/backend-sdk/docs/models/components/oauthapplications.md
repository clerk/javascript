# OAuthApplications

A list of OAuth applications

## Example Usage

```typescript
import { OAuthApplications } from "@clerk/backend-sdk/models/components";

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
      callbackUrl: "https://orderly-porter.net/",
      authorizeUrl: "https://acceptable-passport.name",
      tokenFetchUrl: "https://white-adviser.net",
      userInfoUrl: "https://memorable-finger.net",
      discoveryUrl: "https://judicious-legging.net/",
      tokenIntrospectionUrl: "https://enchanted-handle.name/",
      createdAt: 886961,
      updatedAt: 618826,
    },
  ],
  totalCount: 133461,
};
```

## Fields

| Field                                                                        | Type                                                                         | Required                                                                     | Description                                                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `data`                                                                       | [components.OAuthApplication](../../models/components/oauthapplication.md)[] | :heavy_check_mark:                                                           | N/A                                                                          |
| `totalCount`                                                                 | *number*                                                                     | :heavy_check_mark:                                                           | Total number of OAuth applications<br/>                                      |