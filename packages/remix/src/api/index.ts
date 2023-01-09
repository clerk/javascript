if (!process.env.CLERK_API_KEY && !process.env.CLERK_SECRET_KEY) {
  throw Error(
    'The CLERK_API_KEY or CLERK_SECRET_KEY environment variable must be set to use imports from @clerk/remix/api.',
  );
}

export * from '@clerk/clerk-sdk-node';
