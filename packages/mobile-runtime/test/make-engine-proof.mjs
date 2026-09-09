import fs from 'node:fs';
import { createBaseClientJSON, createBaseEnvironmentJSON } from '../../clerk-js/src/test/fixtures.ts';

const bundle = fs.readFileSync(new URL('../dist/clerk-core-test.js', import.meta.url), 'utf8');
const fixtures = {
  environment: createBaseEnvironmentJSON(),
  client: { ...createBaseClientJSON(), sessions: [], captcha_bypass: true },
};
const proof = String.raw`
const requests = [];
const completions = [];
const opened = [];
const callbackURL = 'clerk-test://sso-callback';
const verify = status => ({status, strategy:'oauth_google', external_verification_redirect_url:'https://provider.example/authorize', attempts:null, expire_at:null, error:null, verified_at_client:null});
globalThis.__clerkNativeRandom = length => btoa('\0'.repeat(length));
globalThis.__clerkNativeEmit = encoded => {
  const message = JSON.parse(encoded);
  if (message.kind !== 'hostRequest' || message.capability !== 'http') throw new Error('Unexpected host request');
  const request = message.args;
  requests.push(request);
  const path = new URL(request.url).pathname;
  let response;
  if (path.endsWith('/environment')) response = fixtures.environment;
  else if (path.endsWith('/client')) response = fixtures.client;
  else {
    const reloading = request.method === 'GET';
    response = path.includes('/sign_ins') ? {
      object:'sign_in', id:'sia_engine', status: reloading ? 'complete' : 'needs_first_factor', identifier:null,
      supported_first_factors:[], supported_second_factors:[], first_factor_verification:verify(reloading ? 'verified' : 'unverified'),
      second_factor_verification:null, created_session_id:reloading ? 'sess_engine' : null, user_data:{},
    } : {
      object:'sign_up', id:'sua_engine', status:reloading ? 'complete' : 'missing_requirements',
      required_fields:[], optional_fields:[], missing_fields:[], unverified_fields:[],
      verifications:{external_account:verify(reloading ? 'verified' : 'unverified')}, unsafe_metadata:{},
      created_session_id:reloading ? 'sess_engine' : null, username:null, first_name:null, last_name:null,
      email_address:null, phone_number:null, has_password:false, created_user_id:null, abandon_at:null,
      web3_wallet:null, legal_accepted_at:null, locale:null,
    };
  }
  Promise.resolve().then(() => ClerkCore.hostReply({id:message.id,result:{status:200,headers:{authorization:'fixture-client'},body:JSON.stringify({response})}}));
};
function check(condition, message) { if (!condition) throw new Error(message); }
globalThis.__engineProof = (async () => {
  check(typeof window === 'undefined' && typeof document === 'undefined', 'Browser globals leaked');
  const core = new ClerkCore.Clerk('pk_test_' + btoa('native-core.clerk.accounts.dev$'));
  let credential = null;
  ClerkCore.installMobileCredentialTransport(core, {read:async()=>credential,write:async v=>{credential=v},remove:async()=>{credential=null}});
  await core.load({standardBrowser:false,telemetry:false,__internal_oauthTransport:{
    getRedirectUrl:async()=>callbackURL,
    open:async url=>{opened.push(String(url));return {callbackUrl:callbackURL+'?rotating_token_nonce=engine_nonce'}},
  }});
  const runtime = new ClerkCore.ResourceRuntime({
    roots:()=>({...ClerkCore.authenticationRoots(core),session:core.session,user:core.user,organization:core.organization}),
    emit:message=>completions.push(message),
  });
  for (const [root,type] of [['signIn','SignIn'],['signUp','SignUp']]) {
    const initial = runtime.snapshot();
    await runtime.invoke({kind:'invoke',id:root,operation:type+'.sso',target:initial.roots[root],args:[{strategy:'oauth_google'}]});
    const completed = completions[completions.length-1];
    check(!completed.failure && completed.result.error === null, root+' failed');
    const state = completed.state.resources.find(r=>r.handle.id===completed.state.roots[root].id).state;
    check(state.status==='complete' && state.createdSessionId==='sess_engine', root+' state not reconciled');
    check(core.session === null, 'SSO activated a session');
  }
  check(opened.length===2, 'Missing browser presentations');
  const auth = requests.filter(r=>/sign_ins|sign_ups/.test(r.url));
  check(auth.length===4, 'Unexpected auth request count');
  for (const request of auth) {
    if (request.method === 'GET') check(new URL(request.url).searchParams.get('rotating_token_nonce')==='engine_nonce','Nonce missing');
    else {
      const body = new URLSearchParams(request.body);
      check(body.get('redirect_url')===callbackURL && body.get('action_complete_redirect_url')===callbackURL,'Callback configuration lost');
    }
  }
  check(!requests.some(r=>/sessions/.test(r.url)), 'Transport performed session work');
  globalThis.__engineResult = 'PASS: generated future signIn.sso and signUp.sso; configured browser round trip; nonce reconciliation; no activation; no DOM';
})().catch(error => { globalThis.__engineResult = 'FAIL: ' + error.message + '\n' + error.stack; });
`;
const output = `const fixtures = ${JSON.stringify(fixtures)};\n${bundle}\n${proof}\n__engineProof.then(() => { if (typeof print === 'function') print(__engineResult); });\n`;
fs.writeFileSync(process.argv[2], output);
