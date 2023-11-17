// Usage:
// From examples/node, run files with "npm test ./src/allowlistIdentifiers.ts"
import { allowlistIdentifiers } from '@clerk/clerk-sdk-node';

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
const allowlistIdentifierList =
  await allowlistIdentifiers.getAllowlistIdentifierList();
console.log(allowlistIdentifierList);
