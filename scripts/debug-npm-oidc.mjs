const { ACTIONS_ID_TOKEN_REQUEST_URL: url, ACTIONS_ID_TOKEN_REQUEST_TOKEN: reqToken, GITHUB_ACTIONS } = process.env;
const registry = 'https://registry.npmjs.org';
const pkg = '@clerk/astro';

console.log('[oidc-debug] GITHUB_ACTIONS =', GITHUB_ACTIONS);
console.log('[oidc-debug] ACTIONS_ID_TOKEN_REQUEST_URL set =', Boolean(url));
console.log('[oidc-debug] ACTIONS_ID_TOKEN_REQUEST_TOKEN set =', Boolean(reqToken));
if (!url || !reqToken) {
  console.log('[oidc-debug] id-token env vars missing: npm will skip OIDC entirely');
  process.exit(0);
}

const idUrl = new URL(url);
idUrl.searchParams.append('audience', `npm:${new URL(registry).hostname}`);
const idRes = await fetch(idUrl, { headers: { Accept: 'application/json', Authorization: `Bearer ${reqToken}` } });
console.log('[oidc-debug] id_token request status =', idRes.status);
const idBody = await idRes.json().catch(() => ({}));
const idToken = idBody?.value;
if (!idToken) {
  console.log('[oidc-debug] id_token missing; body =', JSON.stringify(idBody).slice(0, 500));
  process.exit(0);
}

const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString());
const keys = [
  'iss',
  'aud',
  'sub',
  'repository',
  'repository_id',
  'repository_owner',
  'repository_owner_id',
  'repository_visibility',
  'ref',
  'ref_type',
  'sha',
  'event_name',
  'workflow',
  'workflow_ref',
  'workflow_sha',
  'job_workflow_ref',
  'job_workflow_sha',
  'runner_environment',
  'actor',
  'run_id',
  'run_attempt',
  'environment',
  'enterprise',
];
console.log(
  '[oidc-debug] id_token claims =',
  JSON.stringify(Object.fromEntries(keys.map(k => [k, payload[k]])), null, 2),
);

const exRes = await fetch(`${registry}/-/npm/v1/oidc/token/exchange/package/${encodeURIComponent(pkg)}`, {
  method: 'POST',
  headers: { Accept: 'application/json', Authorization: `Bearer ${idToken}`, 'npm-command': 'publish' },
});
const exText = await exRes.text();
console.log('[oidc-debug] exchange status =', exRes.status);
if (exRes.ok) {
  let keys = [];
  try {
    keys = Object.keys(JSON.parse(exText));
  } catch {}
  console.log('[oidc-debug] exchange succeeded; response keys =', keys.join(','));
} else {
  console.log('[oidc-debug] exchange body =', exText.slice(0, 1000));
}
