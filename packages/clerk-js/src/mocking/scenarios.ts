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
    const emailAddress = ClerkMockDataGenerator.createEmailAddress({
      id: 'email_alexandra_chen',
      emailAddress: 'alexandra.chen@techcorp.com',
    });

    const phoneNumber = ClerkMockDataGenerator.createPhoneNumber({
      id: 'phone_alexandra_chen',
      phoneNumber: '+1 (555) 123-4567',
    });

    const user = ClerkMockDataGenerator.createUser({
      id: 'user_profile_barebones',
      username: 'alexandra.chen',
      firstName: 'Alexandra',
      lastName: 'Chen',
      fullName: 'Alexandra Chen',
      primaryEmailAddressId: 'email_alexandra_chen',
      primaryEmailAddress: emailAddress,
      emailAddresses: [emailAddress],
      primaryPhoneNumberId: 'phone_alexandra_chen',
      primaryPhoneNumber: phoneNumber,
      phoneNumbers: [phoneNumber],
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
      handlers: [
        http.get('*/v1/environment*', () => {
          return HttpResponse.json({
            id: 'env_1',
            object: 'environment',
            auth_config: {
              object: 'auth_config',
              id: 'aac_1',
              single_session_mode: false,
              url_based_session_syncing: true,
            },
            display_config: {
              object: 'display_config',
              id: 'display_config_1',
              branded: true,
              captcha_public_key: 'captcha_key_123',
              home_url: 'https://techcorp.com',
              instance_environment_type: 'production',
              favicon_image_url: 'https://techcorp.com/favicon.ico',
              logo_image_url: 'https://techcorp.com/logo.png',
              preferred_sign_in_strategy: 'password',
              sign_in_url: 'https://techcorp.com/sign-in',
              sign_up_url: 'https://techcorp.com/sign-up',
              user_profile_url: 'https://techcorp.com/user-profile',
              after_sign_in_url: 'https://techcorp.com/dashboard',
              after_sign_up_url: 'https://techcorp.com/onboarding',
            },
            user_settings: {
              attributes: {
                email_address: {
                  enabled: true,
                  required: true,
                  used_for_first_factor: true,
                  first_factors: ['email_code'],
                  used_for_second_factor: false,
                  second_factors: [],
                  verifications: ['email_code'],
                  verify_at_sign_up: true,
                  name: 'email_address',
                },
                phone_number: {
                  enabled: true,
                  required: false,
                  used_for_first_factor: true,
                  first_factors: ['phone_code'],
                  used_for_second_factor: false,
                  second_factors: [],
                  verifications: ['phone_code'],
                  verify_at_sign_up: false,
                  name: 'phone_number',
                },
                username: {
                  enabled: true,
                  required: false,
                  used_for_first_factor: false,
                  first_factors: [],
                  used_for_second_factor: false,
                  second_factors: [],
                  verifications: [],
                  verify_at_sign_up: false,
                  name: 'username',
                },
              },
            },
            organization_settings: {
              object: 'organization_settings',
              id: 'org_settings_1',
              enabled: true,
            },
            commerce_settings: {
              object: 'commerce_settings',
              id: 'commerce_settings_1',
            },
            meta: { responseHeaders: { country: 'us' } },
          });
        }),

        http.patch('*/v1/environment*', () => {
          return HttpResponse.json({
            id: 'env_1',
            object: 'environment',
            auth_config: {
              object: 'auth_config',
              id: 'aac_1',
              single_session_mode: false,
              url_based_session_syncing: true,
            },
            display_config: {
              object: 'display_config',
              id: 'display_config_1',
              branded: true,
              captcha_public_key: 'captcha_key_123',
              home_url: 'https://techcorp.com',
              instance_environment_type: 'production',
              favicon_image_url: 'https://techcorp.com/favicon.ico',
              logo_image_url: 'https://techcorp.com/logo.png',
              preferred_sign_in_strategy: 'password',
              sign_in_url: 'https://techcorp.com/sign-in',
              sign_up_url: 'https://techcorp.com/sign-up',
              user_profile_url: 'https://techcorp.com/user-profile',
              after_sign_in_url: 'https://techcorp.com/dashboard',
              after_sign_up_url: 'https://techcorp.com/onboarding',
            },
            user_settings: {
              attributes: {
                email_address: {
                  enabled: true,
                  required: true,
                  used_for_first_factor: true,
                  first_factors: ['email_code'],
                  used_for_second_factor: false,
                  second_factors: [],
                  verifications: ['email_code'],
                  verify_at_sign_up: true,
                  name: 'email_address',
                },
                phone_number: {
                  enabled: true,
                  required: false,
                  used_for_first_factor: true,
                  first_factors: ['phone_code'],
                  used_for_second_factor: false,
                  second_factors: [],
                  verifications: ['phone_code'],
                  verify_at_sign_up: false,
                  name: 'phone_number',
                },
                username: {
                  enabled: true,
                  required: false,
                  used_for_first_factor: false,
                  first_factors: [],
                  used_for_second_factor: false,
                  second_factors: [],
                  verifications: [],
                  verify_at_sign_up: false,
                  name: 'username',
                },
              },
            },
            organization_settings: {
              object: 'organization_settings',
              id: 'org_settings_1',
              enabled: true,
            },
            commerce_settings: {
              object: 'commerce_settings',
              id: 'commerce_settings_1',
            },
            meta: { responseHeaders: { country: 'us' } },
          });
        }),

        http.get('*/v1/client*', () => {
          const sessionWithProperUserData = {
            id: session.id,
            object: 'session',
            status: session.status,
            expire_at: session.expireAt,
            abandon_at: session.abandonAt,
            factor_verification_age: session.factorVerificationAge,
            last_active_token: session.lastActiveToken,
            last_active_organization_id: session.lastActiveOrganizationId,
            last_active_at: session.lastActiveAt,
            actor: session.actor,
            tasks: session.tasks,
            current_task: session.currentTask,
            user: {
              id: user.id,
              object: 'user',
              external_id: user.externalId,
              primary_email_address_id: user.primaryEmailAddressId,
              primary_phone_number_id: user.primaryPhoneNumberId,
              primary_web3_wallet_id: user.primaryWeb3WalletId,
              username: user.username,
              first_name: user.firstName,
              last_name: user.lastName,
              full_name: user.fullName,
              image_url: user.imageUrl,
              has_image: user.hasImage,
              email_addresses: user.emailAddresses.map(email => ({
                id: email.id,
                object: 'email_address',
                email_address: email.emailAddress,
                verification: email.verification,
                linked_to: email.linkedTo,
              })),
              phone_numbers: user.phoneNumbers.map(phone => ({
                id: phone.id,
                object: 'phone_number',
                phone_number: phone.phoneNumber,
                verification: phone.verification,
                linked_to: phone.linkedTo,
              })),
              web3_wallets: user.web3Wallets.map(wallet => ({
                id: wallet.id,
                object: 'web3_wallet',
                web3_wallet: wallet.web3Wallet,
                verification: wallet.verification,
                linked_to: wallet.linkedTo,
              })),
              external_accounts: user.externalAccounts.map(account => ({
                id: account.id,
                object: 'external_account',
                provider: account.provider,
                email_address: account.emailAddress,
                first_name: account.firstName,
                last_name: account.lastName,
                image_url: account.imageUrl,
                username: account.username,
                public_metadata: account.publicMetadata,
                label: account.label,
                verification: account.verification,
                linked_to: account.linkedTo,
              })),
              enterprise_accounts: user.enterpriseAccounts.map(account => ({
                id: account.id,
                object: 'enterprise_account',
                provider: account.provider,
                email_address: account.emailAddress,
                first_name: account.firstName,
                last_name: account.lastName,
                image_url: account.imageUrl,
                username: account.username,
                public_metadata: account.publicMetadata,
                label: account.label,
                verification: account.verification,
                linked_to: account.linkedTo,
                enterprise_connection: account.enterpriseConnection,
              })),
              passkeys: user.passkeys.map(passkey => ({
                id: passkey.id,
                object: 'passkey',
                name: passkey.name,
                public_key: passkey.publicKey,
                verification: passkey.verification,
                linked_to: passkey.linkedTo,
              })),
              saml_accounts: user.samlAccounts.map(account => ({
                id: account.id,
                object: 'saml_account',
                provider: account.provider,
                email_address: account.emailAddress,
                first_name: account.firstName,
                last_name: account.lastName,
                image_url: account.imageUrl,
                username: account.username,
                public_metadata: account.publicMetadata,
                label: account.label,
                verification: account.verification,
                linked_to: account.linkedTo,
              })),
              organization_memberships: user.organizationMemberships.map(membership => ({
                id: membership.id,
                object: 'organization_membership',
                organization: membership.organization,
                public_metadata: membership.publicMetadata,
                public_user_metadata: membership.publicUserMetadata,
                role: membership.role,
                permissions: membership.permissions,
                created_at: membership.createdAt,
                updated_at: membership.updatedAt,
              })),
              password_enabled: user.passwordEnabled,
              totp_enabled: user.totpEnabled,
              backup_code_enabled: user.backupCodeEnabled,
              two_factor_enabled: user.twoFactorEnabled,
              public_metadata: user.publicMetadata,
              unsafe_metadata: user.unsafeMetadata,
              create_organization_enabled: user.createOrganizationEnabled,
              create_organizations_limit: user.createOrganizationsLimit,
              delete_self_enabled: user.deleteSelfEnabled,
              last_sign_in_at: user.lastSignInAt,
              legal_accepted_at: user.legalAcceptedAt,
              updated_at: user.updatedAt,
              created_at: user.createdAt,
            },
            public_user_data: {
              first_name: user.firstName,
              last_name: user.lastName,
              image_url: user.imageUrl,
              has_image: user.hasImage,
              identifier: user.primaryEmailAddress?.emailAddress || user.username || '',
              user_id: user.id,
            },
            created_at: session.createdAt,
            updated_at: session.updatedAt,
          };

          return HttpResponse.json({
            response: {
              sessions: [sessionWithProperUserData],
              signIn: null,
              signUp: null,
              lastActiveSessionId: session.id,
            },
          });
        }),

        http.get('/v1/client/users/:userId', () => {
          const responseData = {
            response: {
              id: user.id,
              object: 'user',
              external_id: user.externalId,
              primary_email_address_id: user.primaryEmailAddressId,
              primary_phone_number_id: user.primaryPhoneNumberId,
              primary_web3_wallet_id: user.primaryWeb3WalletId,
              username: user.username,
              first_name: user.firstName,
              last_name: user.lastName,
              full_name: user.fullName,
              image_url: user.imageUrl,
              has_image: user.hasImage,
              email_addresses: user.emailAddresses.map(email => ({
                id: email.id,
                object: 'email_address',
                email_address: email.emailAddress,
                verification: email.verification,
                linked_to: email.linkedTo,
              })),
              phone_numbers: user.phoneNumbers.map(phone => ({
                id: phone.id,
                object: 'phone_number',
                phone_number: phone.phoneNumber,
                verification: phone.verification,
                linked_to: phone.linkedTo,
              })),
              web3_wallets: user.web3Wallets.map(wallet => ({
                id: wallet.id,
                object: 'web3_wallet',
                web3_wallet: wallet.web3Wallet,
                verification: wallet.verification,
                linked_to: wallet.linkedTo,
              })),
              external_accounts: user.externalAccounts.map(account => ({
                id: account.id,
                object: 'external_account',
                provider: account.provider,
                email_address: account.emailAddress,
                first_name: account.firstName,
                last_name: account.lastName,
                image_url: account.imageUrl,
                username: account.username,
                public_metadata: account.publicMetadata,
                label: account.label,
                verification: account.verification,
                linked_to: account.linkedTo,
              })),
              enterprise_accounts: user.enterpriseAccounts.map(account => ({
                id: account.id,
                object: 'enterprise_account',
                provider: account.provider,
                email_address: account.emailAddress,
                first_name: account.firstName,
                last_name: account.lastName,
                image_url: account.imageUrl,
                username: account.username,
                public_metadata: account.publicMetadata,
                label: account.label,
                verification: account.verification,
                linked_to: account.linkedTo,
                enterprise_connection: account.enterpriseConnection,
              })),
              passkeys: user.passkeys.map(passkey => ({
                id: passkey.id,
                object: 'passkey',
                name: passkey.name,
                public_key: passkey.publicKey,
                verification: passkey.verification,
                linked_to: passkey.linkedTo,
              })),
              saml_accounts: user.samlAccounts.map(account => ({
                id: account.id,
                object: 'saml_account',
                provider: account.provider,
                email_address: account.emailAddress,
                first_name: account.firstName,
                last_name: account.lastName,
                image_url: account.imageUrl,
                username: account.username,
                public_metadata: account.publicMetadata,
                label: account.label,
                verification: account.verification,
                linked_to: account.linkedTo,
              })),
              organization_memberships: user.organizationMemberships.map(membership => ({
                id: membership.id,
                object: 'organization_membership',
                organization: membership.organization,
                public_metadata: membership.publicMetadata,
                public_user_metadata: membership.publicUserMetadata,
                role: membership.role,
                permissions: membership.permissions,
                created_at: membership.createdAt,
                updated_at: membership.updatedAt,
              })),
              password_enabled: user.passwordEnabled,
              totp_enabled: user.totpEnabled,
              backup_code_enabled: user.backupCodeEnabled,
              two_factor_enabled: user.twoFactorEnabled,
              public_metadata: user.publicMetadata,
              unsafe_metadata: user.unsafeMetadata,
              create_organization_enabled: user.createOrganizationEnabled,
              create_organizations_limit: user.createOrganizationsLimit,
              delete_self_enabled: user.deleteSelfEnabled,
              last_sign_in_at: user.lastSignInAt,
              legal_accepted_at: user.legalAcceptedAt,
              updated_at: user.updatedAt,
              created_at: user.createdAt,
            },
          };

          return HttpResponse.json(responseData);
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
