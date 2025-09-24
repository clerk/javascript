import type { SessionResource, SignInResource, SignUpResource, UserResource } from '@clerk/types';
import { http, HttpResponse } from 'msw';

import { ClerkMockDataGenerator } from './dataGenerator';

/**
 * Defines a mock scenario with handlers and initial state
 */
export interface MockScenario {
  name: string;
  description: string;
  handlers: any[];
  initialState?: {
    user?: UserResource;
    session?: SessionResource;
    signIn?: SignInResource;
    signUp?: SignUpResource;
  };
}

/**
 * Predefined mock scenarios for common Clerk flows
 */
export class ClerkMockScenarios {
  /**
   * UserButton scenario - user is signed in and can access profile
   */
  static userButtonSignedIn(): MockScenario {
    const user = ClerkMockDataGenerator.createUser();
    const session = ClerkMockDataGenerator.createSession({ user });

    return {
      name: 'user-button-signed-in',
      description: 'UserButton component with signed-in user',
      initialState: { user, session },
      handlers: [
        http.get('*/v1/environment*', () => {
          return HttpResponse.json({
            auth: {
              authConfig: {
                singleSessionMode: false,
                urlBasedSessionSyncing: true,
              },
              displayConfig: {
                branded: false,
                captchaPublicKey: null,
                homeUrl: 'https://example.com',
                instanceEnvironmentType: 'production',
                faviconImageUrl: '',
                logoImageUrl: '',
                preferredSignInStrategy: 'password',
                signInUrl: '',
                signUpUrl: '',
                userProfileUrl: '',
                afterSignInUrl: '',
                afterSignUpUrl: '',
              },
            },
            user: user,
            organization: null,
          });
        }),

        http.patch('*/v1/environment*', () => {
          return HttpResponse.json({
            auth: {
              authConfig: {
                singleSessionMode: false,
                urlBasedSessionSyncing: true,
              },
              displayConfig: {
                branded: false,
                captchaPublicKey: null,
                homeUrl: 'https://example.com',
                instanceEnvironmentType: 'production',
                faviconImageUrl: '',
                logoImageUrl: '',
                preferredSignInStrategy: 'password',
                signInUrl: '',
                signUpUrl: '',
                userProfileUrl: '',
                afterSignInUrl: '',
                afterSignUpUrl: '',
              },
            },
            user: user,
            organization: null,
          });
        }),

        http.get('*/v1/client*', () => {
          return HttpResponse.json({
            response: {
              sessions: [session],
              signIn: null,
              signUp: null,
              lastActiveSessionId: session.id,
            },
          });
        }),

        http.get('/v1/client/users/:userId', () => {
          return HttpResponse.json({ response: user });
        }),

        http.post('*/v1/client/sessions/*/tokens*', () => {
          return HttpResponse.json({
            response: {
              jwt: 'mock-jwt-token',
              session: session,
            },
          });
        }),

        http.post('/v1/client/sessions/:sessionId/end', () => {
          return HttpResponse.json({
            response: {
              ...session,
              status: 'ended',
            },
          });
        }),

        http.post('https://clerk-telemetry.com/v1/event', () => {
          return HttpResponse.json({
            success: true,
          });
        }),

        http.all('https://*.clerk.com/v1/*', () => {
          return HttpResponse.json({
            response: {},
          });
        }),
      ],
    };
  }

  static userProfileBarebones(): MockScenario {
    const user = ClerkMockDataGenerator.createUser({
      id: 'user_profile_barebones',
      username: 'alexandra.chen',
      firstName: 'Alexandra',
      lastName: 'Chen',
      fullName: 'Alexandra Chen',
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      hasImage: true,
      publicMetadata: {
        bio: 'Senior Software Engineer passionate about building scalable web applications.',
        location: 'San Francisco, CA',
        website: 'https://alexchen.dev',
      },
    });

    const session = ClerkMockDataGenerator.createSession({ user });

    return {
      name: 'user-profile-barebones',
      description: 'Barebones user profile with basic data points',
      initialState: { user, session },
      handlers: [
        http.get('*/v1/environment*', () => {
          return HttpResponse.json({
            auth: {
              authConfig: {
                singleSessionMode: false,
                urlBasedSessionSyncing: true,
              },
              displayConfig: {
                branded: true,
                captchaPublicKey: 'captcha_key_123',
                homeUrl: 'https://techcorp.com',
                instanceEnvironmentType: 'production',
                faviconImageUrl: 'https://techcorp.com/favicon.ico',
                logoImageUrl: 'https://techcorp.com/logo.png',
                preferredSignInStrategy: 'password',
                signInUrl: 'https://techcorp.com/sign-in',
                signUpUrl: 'https://techcorp.com/sign-up',
                userProfileUrl: 'https://techcorp.com/user-profile',
                afterSignInUrl: 'https://techcorp.com/dashboard',
                afterSignUpUrl: 'https://techcorp.com/onboarding',
              },
            },
            user: user,
            organization: null,
          });
        }),

        http.patch('*/v1/environment*', () => {
          return HttpResponse.json({
            auth: {
              authConfig: {
                singleSessionMode: false,
                urlBasedSessionSyncing: true,
              },
              displayConfig: {
                branded: true,
                captchaPublicKey: 'captcha_key_123',
                homeUrl: 'https://techcorp.com',
                instanceEnvironmentType: 'production',
                faviconImageUrl: 'https://techcorp.com/favicon.ico',
                logoImageUrl: 'https://techcorp.com/logo.png',
                preferredSignInStrategy: 'password',
                signInUrl: 'https://techcorp.com/sign-in',
                signUpUrl: 'https://techcorp.com/sign-up',
                userProfileUrl: 'https://techcorp.com/user-profile',
                afterSignInUrl: 'https://techcorp.com/dashboard',
                afterSignUpUrl: 'https://techcorp.com/onboarding',
              },
            },
            user: user,
            organization: null,
          });
        }),

        http.get('*/v1/client*', () => {
          return HttpResponse.json({
            response: {
              sessions: [session],
              signIn: null,
              signUp: null,
              lastActiveSessionId: session.id,
            },
          });
        }),

        http.get('/v1/client/users/:userId', () => {
          return HttpResponse.json({ response: user });
        }),

        http.post('*/v1/client/sessions/*/tokens*', () => {
          return HttpResponse.json({
            response: {
              jwt: 'mock-jwt-token-comprehensive',
              session: session,
            },
          });
        }),

        http.post('/v1/client/sessions/:sessionId/end', () => {
          return HttpResponse.json({
            response: {
              ...session,
              status: 'ended',
            },
          });
        }),

        http.post('https://clerk-telemetry.com/v1/event', () => {
          return HttpResponse.json({
            success: true,
          });
        }),

        http.all('https://*.clerk.com/v1/*', () => {
          return HttpResponse.json({
            response: {},
          });
        }),
      ],
    };
  }
}
