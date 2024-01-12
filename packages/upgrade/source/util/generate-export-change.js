import fs from 'fs';
import path from 'path';

// WIP, a util script used for quickly generating a large number of nearly identical change files
const movedToServer = [
	'MultisessionAppSupport',
	'auth',
	'currentUser',
	'authMiddleware', // deprecated
	'clerkMiddleware', // new
	'redirectToSignIn',
	'redirectToSignUp',
	'buildClerkProps',
	'verifyToken',
	'isClerkAPIResponseError',
	'isEmailLinkError',
	'isKnownError',
	'isMetamaskError',
	'EmailLinkErrorCode',
	'withClerk',
	'withSession',
	'withUser',
	'WithClerk',
	'WithSession',
	'WithUser',
];

const clerkBackendExports = ['createClerkClient', 'verifyToken'];
