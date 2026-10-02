import { randomBytes } from 'node:crypto';

export type TestUser = { id: string; email: string; password: string };

function bapi(path: string, init: RequestInit) {
  return fetch(`${process.env.CLERK_API_URL ?? 'https://api.clerk.com'}/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`, 'Content-Type': 'application/json' },
  });
}

export async function createTestUser(): Promise<TestUser> {
  const suffix = randomBytes(4).toString('hex');
  const email = `${suffix}+clerk_test@example.com`;
  const password = `ClerkCI!${randomBytes(8).toString('hex')}Aa1`;
  const response = await bapi('/users', {
    method: 'POST',
    body: JSON.stringify({
      email_address: [email],
      username: `e2e_${suffix}`,
      password,
      bypass_client_trust: true,
    }),
  });
  if (!response.ok) {
    throw new Error(`BAPI user creation failed (HTTP ${response.status}): ${await response.text()}`);
  }
  const { id } = (await response.json()) as { id: string };
  return { id, email, password };
}

export async function deleteTestUser({ id }: TestUser) {
  await bapi(`/users/${id}`, { method: 'DELETE' });
}
