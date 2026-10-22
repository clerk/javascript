import type { AttributeData, EnvironmentResource } from '@clerk/shared/types';

export type ProfileEnvironment = {
  userSettings: Pick<
    EnvironmentResource['userSettings'],
    'instanceIsPasswordBased' | 'passwordSettings' | 'usernameSettings' | 'socialProviderStrategies'
  > & {
    web3FirstFactors?: EnvironmentResource['userSettings']['web3FirstFactors'];
    signUp?: Pick<EnvironmentResource['userSettings']['signUp'], 'mfa'>;
    enterpriseSSO: Pick<EnvironmentResource['userSettings']['enterpriseSSO'], 'enabled'>;
    attributes: Partial<
      Record<
        'email_address' | 'username' | 'phone_number' | 'web3_wallet' | 'passkey' | 'authenticator_app' | 'backup_code',
        Pick<
          AttributeData,
          'enabled' | 'immutable' | 'used_for_first_factor' | 'used_for_second_factor' | 'verifications'
        > &
          Partial<Pick<AttributeData, 'second_factors'>>
      >
    >;
  };
  authConfig: Pick<EnvironmentResource['authConfig'], 'reverification'>;
  displayConfig: Pick<EnvironmentResource['displayConfig'], 'userProfileUrl'> &
    Partial<Pick<EnvironmentResource['displayConfig'], 'applicationName'>>;
};

export type ProfileOAuthResponse = { verification?: { externalVerificationRedirectURL: URL | null } | null };
