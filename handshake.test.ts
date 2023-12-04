// @ts-ignore ignore types
import * as http from 'http';
import * as cfg from './handshakeTestConfigs';

console.log({ http, cfg });

const pkHost = 'clerk.pktest.com';
const domain = 'domaintest.com';
const proxyUrl = 'https://proxytest.com/clerk';

//create a server object:
const server = http.createServer(function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(jwks)); //write a response to the client
  res.end(); //end the response
});

beforeAll(() => {
  console.log(
    'Starting jwks service on 127.0.0.1:4199.\nMake sure the framework has CLERK_API_URL set to http://localhost:4199',
  );
  server.listen(4199); //the server object listens on port 8080
});

afterAll(() => {
  server.close();
});

const url = process.argv.find(x => x.startsWith('--url='))?.replace('--url=', '');
if (!url) {
  throw new Error('Must pass URL like: jest handshake --url=http://localhost:4011');
}

console.log('Running tests for ', url);

test('Hello world', async () => {
  const config = cfg.generateConfig({
    mode: 'test',
    pkHost,
  });
  const token = config.generateToken({ user_id: 'user_123456', exp: 123456 });
  const res = await fetch(url, {
    headers: new Headers({
      Cookie: `__client_uat=12345; __session=${token}`,
      'X-Publishable-Key': cfg.pk,
      'X-Secret-Key': cfg.sk,
    }),
    redirect: 'manual',
  });
  console.log('res', res.headers);
  expect(res.status).toBe(307);
});
