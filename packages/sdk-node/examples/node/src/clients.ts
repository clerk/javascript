// Usage:
// From examples/node, run files with "npm test ./src/clients.ts"
import clerk, { clients } from '@clerk/clerk-sdk-node';

const clientId = process.env.CLIENT_ID || '';
const sessionToken = process.env.SESSION_TOKEN || '';

// setClerkServerApiUrl(serverApiUrl);

console.log('Get client list');
const clientList = await clients.getClientList();
console.log(clientList);

console.log('Get single client');
const client = await clients.getClient(clientId);
console.log(client);

try {
  console.log('Verify client');
  const verifiedClient = await clients.verifyClient(sessionToken);
  console.log(verifiedClient);
} catch (error) {
  console.log(error);
}

try {
  console.log('Get single client for invalid clientId');
  const invalidClient = await clients.getClient('foobar');
  console.log(invalidClient);
} catch (error) {
  console.log(error);
}

try {
  console.log('Get client list with invalid API key');
  clerk.apiKey = 'snafu';
  const invalidClients = await clerk.clients.getClientList();
  console.log(invalidClients);
} catch (error) {
  console.log(error);
}
