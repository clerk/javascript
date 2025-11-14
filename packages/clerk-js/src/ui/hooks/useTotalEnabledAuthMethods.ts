import type { Attribute } from '@clerk/shared/types';

import { useEnvironment } from '../contexts/EnvironmentContext';
import { useEnabledThirdPartyProviders } from './useEnabledThirdPartyProviders';

/**
 * Calculates the total count of all enabled authentication methods.
 * This includes:
 * - First factor identifiers (email_address, username, phone_number)
 * - OAuth strategies
 * - Web3 strategies
 * - Alternative phone code channels
 *
 * Note: When both email and username are enabled, they count as 2 separate methods
 * even though the UI may show them as one combined field.
 */
export const useTotalEnabledAuthMethods = (): { totalCount: number } => {
  const { userSettings } = useEnvironment();
  const { authenticatableOauthStrategies, web3Strategies, alternativePhoneCodeChannels } =
    useEnabledThirdPartyProviders();

  // Count enabled first factor identifiers
  // Use the raw array (not grouped) to get accurate counts
  // Filter out 'passkey' as it's not counted as a separate method in the UI
  const firstFactorCount = userSettings.enabledFirstFactorIdentifiers.filter(
    (attr: Attribute) => attr !== 'passkey',
  ).length;

  // Count third-party authentication methods
  const oauthCount = authenticatableOauthStrategies.length;
  const web3Count = web3Strategies.length;
  const alternativePhoneCodeCount = alternativePhoneCodeChannels.length;

  const totalCount = firstFactorCount + oauthCount + web3Count + alternativePhoneCodeCount;

  return { totalCount };
};
