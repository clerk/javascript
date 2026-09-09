const fixtures = require('./proof-fixtures.json');
const originalFetch = global.fetch;
const state = { client: fixtures.authenticatedClient, requests: [], revision: 0 };
const encode = value => global.btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
function token() {
  const now = Math.floor(Date.now() / 1000);
  return {
    object: 'token',
    jwt: `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ sub: 'user_native', sid: 'sess_native', iat: now, exp: now + 600, iss: 'https://native-core.clerk.accounts.dev' })}.fixture_signature`,
  };
}
global.__clerkProof = state;
global.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input.url || String(input);
  if (!url.startsWith('https://native-core.clerk.accounts.dev/')) return originalFetch(input, init);
  const path = new URL(url).pathname;
  const method = init.method || 'GET';
  const logicalMethod = new URL(url).searchParams.get('_method') || method;
  const request = { path, method, logicalMethod, body: init.body == null ? null : String(init.body) };
  state.requests.push(request);
  console.log('[CLERK_SHARED_OWNER_PROOF]', JSON.stringify(request));
  let response;
  const user = state.client.sessions[0]?.user;
  if (path.endsWith('/environment'))
    return new Response(JSON.stringify({ response: fixtures.environment }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  else if (path.endsWith('/client') && method === 'GET') response = state.client;
  else if (path.endsWith('/me/sessions/active')) response = [];
  else if (path.endsWith('/client/sessions') && logicalMethod === 'DELETE') {
    state.client = { ...fixtures.client, id: 'client_native', sessions: [], last_active_session_id: null };
    response = state.client;
  } else if (path.endsWith('/me') || path.endsWith('/users/user_native')) {
    const params = new URLSearchParams(String(init.body || ''));
    if (params.has('first_name')) user.first_name = params.get('first_name');
    if (params.has('last_name')) user.last_name = params.get('last_name');
    state.client.sessions[0].public_user_data.first_name = user.first_name;
    state.client.sessions[0].public_user_data.last_name = user.last_name;
    state.revision++;
    response = user;
  } else if (path.includes('/tokens')) response = token();
  else if (path.endsWith('/touch')) response = state.client.sessions[0];
  else if (path.endsWith('/remove') || path.endsWith('/end')) {
    state.client = { ...fixtures.client, id: 'client_native', sessions: [], last_active_session_id: null };
    response = state.client;
  } else {
    console.error('[CLERK_SHARED_OWNER_UNEXPECTED]', path);
    return new Response(
      JSON.stringify({ errors: [{ code: 'fixture_route_missing', message: `Missing proof route ${path}` }] }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
  for (const session of state.client.sessions) session.last_active_token = token();
  return new Response(JSON.stringify({ response, client: state.client }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', authorization: 'fixture_client_credential' },
  });
};
