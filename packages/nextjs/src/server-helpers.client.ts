const mockImplementation = (name: string) => {
  throw new Error(`${name} can only be used in a server environment.`);
};

export const auth = () => mockImplementation('auth()');
export const currentUser = () => mockImplementation('currentUser()');
export const authMiddleware = () => mockImplementation('authMiddleware()');
export const getAuth = () => mockImplementation('getAuth()');
export const clerkClient = () => mockImplementation('clerkClient()');
export const withClerkMiddleware = () => mockImplementation('withClerkMiddleware()');
export const redirectToSignIn = () => mockImplementation('redirectToSignIn()');
export const redirectToSignUp = () => mockImplementation('redirectToSignUp()');
