const fs = require('node:fs');
const path = require('node:path');

const { isPublishableKey } = require('@clerk/shared');

async function createEphemeralAccount() {
  const body = await postJSON('https://api.clerkstage.dev/v1/public/demo_instance');

  const account = {
    publishableKey: body.frontend_api_key,
    secretKey: body.backend_api_key,
    expiresAt: daysFromNow(1),
  };

  write(account);

  return account;
}

async function fetchEphemeralAccount() {
  const account = read();

  if (account) {
    const verified = await verifyEphemeralAccount(account);

    if (verified) {
      return account;
    }
  }

  return await createEphemeralAccount();
}

async function verifyEphemeralAccount(account) {
  // TODO: API not implemented yet.
  //
  // try {
  //   await postJSON('https://api.clerkstage.dev/v1/ephemeral-account/verify', {
  //     publishable_key: account.publishableKey,
  //     secret_key: account.secretKey,
  //   })
  //
  //   return true
  //
  // } catch (err) {
  //   if (err instanceof ClientError) {
  //     return false;
  //   }
  //
  //   throw err;
  // }

  if (!isPublishableKey(account.publishableKey)) {
    return false;
  }

  // NOTE: Simulate failed verification after 15 minutes
  if (account.expiresAt < daysFromNow(1) - 60 * 15) {
    return false;
  }

  return true;
}

const PATH = path.join(process.cwd(), 'node_modules', '.cache', 'clerkjs', 'ephemeral.json');

function read() {
  try {
    if (fs.existsSync(PATH)) {
      const config = JSON.parse(fs.readFileSync(PATH, { encoding: 'utf-8' }));

      if (config.expiresAt < now()) {
        return null;
      }

      return config;
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      return null;
    }

    throw error;
  }
}

function write(obj) {
  fs.mkdirSync(path.dirname(PATH), { recursive: true });

  const content = JSON.stringify(obj);

  fs.writeFileSync(PATH, content, {
    encoding: 'utf8',
    mode: '0777',
    flag: 'w',
  });
}

function postJSON(url, body) {
  return apiResult(
    fetch(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  );
}

async function apiResult(whenResponse) {
  const response = await whenResponse;

  if (response.status === 204) {
    return null;
  } else if (response.ok) {
    const body = await response.json();
    return body;
  } else if (response.status >= 400 && response.status < 500) {
    const body = await response.json();
    const error = new ClientError(response.statusText, response.status, body);
    throw error;
  } else {
    const error = new ServerError(response.statusText, response.status);
    throw error;
  }
}

class ClientError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.name = 'ClientError';
    this.body = body;
  }
}

class ServerError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ServerError';
  }
}

function now() {
  return daysFromNow(0);
}

function daysFromNow(days) {
  return Math.floor(Date.now() / 1000) + 60 * 60 * 24 * days;
}

module.exports.fetchEphemeralAccount = fetchEphemeralAccount;
