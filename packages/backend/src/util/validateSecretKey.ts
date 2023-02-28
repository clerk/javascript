export const validateSecretKey = (key: string) => {
  if (!key) {
    throw Error(
      'Missing Clerk Secret Key or API Key. Go to https://dashboard.clerk.dev and get your key for your instance.',
    );
  }

  //TODO: Check if the key is invalid and throw error
};
