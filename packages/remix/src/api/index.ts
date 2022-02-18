if (!process.env.CLERK_API_KEY) {
  throw Error('The CLERK_API_KEY environment variable must be set to use imports from @clerk/remix/api.');
}

export * from '@clerk/clerk-sdk-node';
