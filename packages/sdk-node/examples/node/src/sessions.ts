// Usage:
// From examples/node, run files with "npm test ./src/sessions.ts"
import { sessions } from '@clerk/clerk-sdk-node';

const clientId = process.env.CLIENT_ID || '';
const userId = process.env.USER_ID || '';
const sessionId = process.env.SESSION_ID || '';
const sessionIdtoRevoke = process.env.SESSION_ID_TO_REVOKE || '';
const sessionToken = process.env.SESSION_TOKEN || '';

console.log('Get session list');
const { data: sessionList } = await sessions.getSessionList();
console.log(sessionList);

console.log('Get session list filtered by userId');
const { data: filteredSessions1 } = await sessions.getSessionList({ userId });
console.log(filteredSessions1);

console.log('Get session list filtered by clientId');
const { data: filteredSessions2 } = await sessions.getSessionList({ clientId });
console.log(filteredSessions2);

console.log('Get single session');
const { data: session } = await sessions.getSession(sessionId);
console.log(session);

console.log('Revoke session');
const { data: revokedSession } = await sessions.revokeSession(sessionIdtoRevoke);
console.log(revokedSession);

console.log('Verify session');
const { data: verifiedSession } = await sessions.verifySession(sessionId, sessionToken);
console.log(verifiedSession);
