// Usage:
// From examples/node, transpile files by running `tsc`
// To run:
// node --require dotenv/config dist/allowlistIdentifiers.js

import {
  allowlistIdentifiers,
  setClerkServerApiUrl,
} from '@clerk/clerk-sdk-node';

const serverApiUrl = process.env.CLERK_API_URL || '';

setClerkServerApiUrl(serverApiUrl);

// Add an allowlist identifier
await allowlistIdentifiers.createAllowlistIdentifier({
  identifier: 'test@example.com',
  notify: false,
});

// Add another allowlist identifier
const { id } = await allowlistIdentifiers.createAllowlistIdentifier({
  identifier: 'will-be-deleted@example.com',
  notify: false,
});

// Delete the last allowlist identifier
await allowlistIdentifiers.deleteAllowlistIdentifier(String(id));

// Get allowlist identifier list
let allowlistIdentifierList =
  await allowlistIdentifiers.getAllowlistIdentifierList();
console.log(allowlistIdentifierList);
