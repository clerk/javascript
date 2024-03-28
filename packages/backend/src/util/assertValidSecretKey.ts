export function assertValidSecretKey(val: unknown): asserts val is string {
  if (!val || typeof val !== 'string') {
    throw Error('Missing Clerk Secret Key. Go to https://dashboard.clerk.com and get your key for your instance.');
  }

  //TODO: Check if the key is invalid and throw error
}
