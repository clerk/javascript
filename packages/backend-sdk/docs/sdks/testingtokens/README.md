# TestingTokens

(_testingTokens_)

## Overview

### Available Operations

- [create](#create) - Retrieve a new testing token

## create

Retrieve a new testing token.

### Example Usage

```typescript
import { Clerk } from '@clerk/backend-sdk';

const clerk = new Clerk({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const result = await clerk.testingTokens.create();

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkCore } from '@clerk/backend-sdk/core.js';
import { testingTokensCreate } from '@clerk/backend-sdk/funcs/testingTokensCreate.js';

// Use `ClerkCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerk = new ClerkCore({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const res = await testingTokensCreate(clerk);

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
| `options`              | RequestOptions                                                                          | :heavy_minus_sign: | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions` | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options) | :heavy_minus_sign: | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`      | [RetryConfig](../../lib/utils/retryconfig.md)                                           | :heavy_minus_sign: | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.TestingToken](../../models/components/testingtoken.md)\>**

### Errors

| Error Type      | Status Code | Content Type |
| --------------- | ----------- | ------------ |
| errors.APIError | 4XX, 5XX    | \*/\*        |
