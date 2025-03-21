# RedirectUrls

(_redirectUrls_)

## Overview

### Available Operations

- [list](#list) - List all redirect URLs
- [create](#create) - Create a redirect URL
- [get](#get) - Retrieve a redirect URL
- [delete](#delete) - Delete a redirect URL

## list

Lists all whitelisted redirect_urls for the instance

### Example Usage

```typescript
import { Clerk } from '@clerk/backend-sdk';

const clerk = new Clerk({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const result = await clerk.redirectUrls.list({});

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkCore } from '@clerk/backend-sdk/core.js';
import { redirectUrlsList } from '@clerk/backend-sdk/funcs/redirectUrlsList.js';

// Use `ClerkCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerk = new ClerkCore({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const res = await redirectUrlsList(clerk, {});

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter              | Type                                                                                     | Required           | Description                                                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`              | [operations.ListRedirectURLsRequest](../../models/operations/listredirecturlsrequest.md) | :heavy_check_mark: | The request object to use for the request.                                                                                                                                     |
| `options`              | RequestOptions                                                                           | :heavy_minus_sign: | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions` | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)  | :heavy_minus_sign: | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`      | [RetryConfig](../../lib/utils/retryconfig.md)                                            | :heavy_minus_sign: | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.RedirectURL[]](../../models/.md)\>**

### Errors

| Error Type      | Status Code | Content Type |
| --------------- | ----------- | ------------ |
| errors.APIError | 4XX, 5XX    | \*/\*        |

## create

Create a redirect URL

### Example Usage

```typescript
import { Clerk } from '@clerk/backend-sdk';

const clerk = new Clerk({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const result = await clerk.redirectUrls.create();

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkCore } from '@clerk/backend-sdk/core.js';
import { redirectUrlsCreate } from '@clerk/backend-sdk/funcs/redirectUrlsCreate.js';

// Use `ClerkCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerk = new ClerkCore({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const res = await redirectUrlsCreate(clerk);

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter              | Type                                                                                               | Required           | Description                                                                                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`              | [operations.CreateRedirectURLRequestBody](../../models/operations/createredirecturlrequestbody.md) | :heavy_check_mark: | The request object to use for the request.                                                                                                                                     |
| `options`              | RequestOptions                                                                                     | :heavy_minus_sign: | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions` | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)            | :heavy_minus_sign: | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`      | [RetryConfig](../../lib/utils/retryconfig.md)                                                      | :heavy_minus_sign: | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.RedirectURL](../../models/components/redirecturl.md)\>**

### Errors

| Error Type         | Status Code | Content Type     |
| ------------------ | ----------- | ---------------- |
| errors.ClerkErrors | 400, 422    | application/json |
| errors.APIError    | 4XX, 5XX    | \*/\*            |

## get

Retrieve the details of the redirect URL with the given ID

### Example Usage

```typescript
import { Clerk } from '@clerk/backend-sdk';

const clerk = new Clerk({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const result = await clerk.redirectUrls.get({
    id: '<id>',
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkCore } from '@clerk/backend-sdk/core.js';
import { redirectUrlsGet } from '@clerk/backend-sdk/funcs/redirectUrlsGet.js';

// Use `ClerkCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerk = new ClerkCore({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const res = await redirectUrlsGet(clerk, {
    id: '<id>',
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter              | Type                                                                                    | Required           | Description                                                                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`              | [operations.GetRedirectURLRequest](../../models/operations/getredirecturlrequest.md)    | :heavy_check_mark: | The request object to use for the request.                                                                                                                                     |
| `options`              | RequestOptions                                                                          | :heavy_minus_sign: | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions` | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options) | :heavy_minus_sign: | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`      | [RetryConfig](../../lib/utils/retryconfig.md)                                           | :heavy_minus_sign: | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.RedirectURL](../../models/components/redirecturl.md)\>**

### Errors

| Error Type         | Status Code | Content Type     |
| ------------------ | ----------- | ---------------- |
| errors.ClerkErrors | 404         | application/json |
| errors.APIError    | 4XX, 5XX    | \*/\*            |

## delete

Remove the selected redirect URL from the whitelist of the instance

### Example Usage

```typescript
import { Clerk } from '@clerk/backend-sdk';

const clerk = new Clerk({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const result = await clerk.redirectUrls.delete({
    id: '<id>',
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkCore } from '@clerk/backend-sdk/core.js';
import { redirectUrlsDelete } from '@clerk/backend-sdk/funcs/redirectUrlsDelete.js';

// Use `ClerkCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerk = new ClerkCore({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const res = await redirectUrlsDelete(clerk, {
    id: '<id>',
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter              | Type                                                                                       | Required           | Description                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`              | [operations.DeleteRedirectURLRequest](../../models/operations/deleteredirecturlrequest.md) | :heavy_check_mark: | The request object to use for the request.                                                                                                                                     |
| `options`              | RequestOptions                                                                             | :heavy_minus_sign: | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions` | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)    | :heavy_minus_sign: | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`      | [RetryConfig](../../lib/utils/retryconfig.md)                                              | :heavy_minus_sign: | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.DeletedObject](../../models/components/deletedobject.md)\>**

### Errors

| Error Type         | Status Code | Content Type     |
| ------------------ | ----------- | ---------------- |
| errors.ClerkErrors | 404         | application/json |
| errors.APIError    | 4XX, 5XX    | \*/\*            |
