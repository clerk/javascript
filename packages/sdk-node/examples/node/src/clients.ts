// Usage:
// From examples/node, transpile files by running `tsc`
// To run:
// node --require dotenv/config dist/clients.js

import clerk, { clients,setClerkServerApiUrl } from '@clerk/clerk-sdk-node';

const serverApiUrl = process.env.CLERK_API_URL || '';
const clientId = process.env.CLIENT_ID || '';
const sessionToken = process.env.SESSION_TOKEN || '';

setClerkServerApiUrl(serverApiUrl);

console.log('Get client list');
let clientList = await clients.getClientList();
console.log(clientList);

console.log('Get single client');
let client = await clients.getClient(clientId);
console.log(client);

try {
  console.log('Verify client');
  let verifiedClient = await clients.verifyClient(sessionToken);
  console.log(verifiedClient);
} catch (error) {
  console.log(error);
}

try {
  console.log('Get single client for invalid clientId');
  let invalidClient = await clients.getClient('foobar');
  console.log(invalidClient);
} catch (error) {
  console.log(error);
}

try {
  console.log('Get client list with invalid API key');
  clerk.apiKey = 'snafu';
  let invalidClients = await clerk.clients.getClientList();
  console.log(invalidClients);
} catch (error) {
  console.log(error);
}
