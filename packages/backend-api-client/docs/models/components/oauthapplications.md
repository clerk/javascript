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
      callbackUrl: "https://raw-hydrant.com/",
      authorizeUrl: "https://aware-pasta.com/",
      tokenFetchUrl: "https://icy-finger.net",
      userInfoUrl: "https://weekly-gallery.info/",
      discoveryUrl: "https://fortunate-fen.biz/",
      tokenIntrospectionUrl: "https://sparse-hyphenation.info",
      createdAt: 178484,
      updatedAt: 329924,
    },
  ],
  totalCount: 546216,
};
```

## Fields

| Field                                                                        | Type                                                                         | Required                                                                     | Description                                                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `data`                                                                       | [components.OAuthApplication](../../models/components/oauthapplication.md)[] | :heavy_check_mark:                                                           | N/A                                                                          |
| `totalCount`                                                                 | *number*                                                                     | :heavy_check_mark:                                                           | Total number of OAuth applications<br/>                                      |