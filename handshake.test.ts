// @ts-ignore ignore types
import * as http from 'http';
import { generateConfig, getJwksFromSecretKey } from './handshakeTestConfigs';

const pkHost = 'clerk.pktest.com';
const domain = 'domaintest.com';
const proxyUrl = 'https://proxytest.com/clerk';

//create a server object:
const server = http.createServer(function (req, res) {
  console.log(req.url);
  const sk = req.headers.authorization?.replace('Bearer ', '');
  if (!sk) {
    console.log('Empty req to', req.url, req.headers);
  }

  const jwks = getJwksFromSecretKey(sk);
  console.log('JWKS', jwks);

  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(getJwksFromSecretKey(sk))); //write a response to the client
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
  setImmediate(function () {
    server.emit('close');
  });
});

const url = process.argv.find(x => x.startsWith('--url='))?.replace('--url=', '');
if (!url) {
  throw new Error('Must pass URL like: jest handshake --url=http://localhost:4011');
}

console.log('Running tests for ', url);

test('Hello world', async () => {
  const config = generateConfig({
    mode: 'test',
  });
  const token = config.generateToken({ sub: 'user_123456', exp: 123456 });
  const res = await fetch(url, {
    headers: new Headers({
      Cookie: `__client_uat=12345; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
    }),
    redirect: 'manual',
  });
  console.log('res', res.headers);
  expect(res.status).toBe(307);
});
