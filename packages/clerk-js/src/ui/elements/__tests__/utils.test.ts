import type { OAuthStrategy, Web3Strategy } from '@clerk/types';

import { distributeStrategiesIntoRows } from '../utils';

describe('distributeStrategiesIntoRows', () => {
  type TestStrategy = OAuthStrategy | Web3Strategy | string;

  describe('with lastAuthenticationStrategy', () => {
    it('separates lastAuthenticationStrategy into its own row when it exists in strategies', () => {
      const strategies: TestStrategy[] = ['oauth_google', 'oauth_facebook', 'oauth_github'];
      const lastAuthenticationStrategy: TestStrategy = 'oauth_facebook';
      const maxStrategiesPerRow = 3;

      const result = distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, lastAuthenticationStrategy);

      expect(result).toEqual({
        strategyRows: [['oauth_facebook'], ['oauth_google', 'oauth_github']],
        lastAuthenticationStrategyPresent: true,
      });
    });

    it('returns only lastAuthenticationStrategy when it is the only strategy', () => {
      const strategies: TestStrategy[] = ['oauth_google'];
      const lastAuthenticationStrategy: TestStrategy = 'oauth_google';
      const maxStrategiesPerRow = 3;

      const result = distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, lastAuthenticationStrategy);

      expect(result).toEqual({
        strategyRows: [['oauth_google']],
        lastAuthenticationStrategyPresent: true,
      });
    });

    it('handles lastAuthenticationStrategy that is not in the strategies array', () => {
      const strategies: TestStrategy[] = ['oauth_google', 'oauth_facebook', 'oauth_github'];
      const lastAuthenticationStrategy: TestStrategy = 'oauth_twitter';
      const maxStrategiesPerRow = 3;

      const result = distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, lastAuthenticationStrategy);

      expect(result).toEqual({
        strategyRows: [['oauth_google', 'oauth_facebook', 'oauth_github']],
        lastAuthenticationStrategyPresent: false,
      });
    });

    it('handles null lastAuthenticationStrategy', () => {
      const strategies: TestStrategy[] = ['oauth_google', 'oauth_facebook', 'oauth_github'];
      const lastAuthenticationStrategy = null;
      const maxStrategiesPerRow = 3;

      const result = distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, lastAuthenticationStrategy);

      expect(result).toEqual({
        strategyRows: [['oauth_google', 'oauth_facebook', 'oauth_github']],
        lastAuthenticationStrategyPresent: false,
      });
    });

    it('handles undefined lastAuthenticationStrategy', () => {
      const strategies: TestStrategy[] = ['oauth_google', 'oauth_facebook', 'oauth_github'];
      const lastAuthenticationStrategy = undefined;
      const maxStrategiesPerRow = 3;

      const result = distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, lastAuthenticationStrategy);

      expect(result).toEqual({
        strategyRows: [['oauth_google', 'oauth_facebook', 'oauth_github']],
        lastAuthenticationStrategyPresent: false,
      });
    });

    it('distributes remaining strategies across multiple rows after separating lastAuthenticationStrategy', () => {
      const strategies: TestStrategy[] = [
        'oauth_google',
        'oauth_facebook',
        'oauth_github',
        'oauth_twitter',
        'oauth_apple',
        'oauth_discord',
      ];
      const lastAuthenticationStrategy: TestStrategy = 'oauth_facebook';
      const maxStrategiesPerRow = 3;

      const result = distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, lastAuthenticationStrategy);

      expect(result).toEqual({
        strategyRows: [
          ['oauth_facebook'],
          ['oauth_google', 'oauth_github', 'oauth_twitter'],
          ['oauth_apple', 'oauth_discord'],
        ],
        lastAuthenticationStrategyPresent: true,
      });
    });

    it('works with different strategy types including Web3', () => {
      const strategies: TestStrategy[] = ['oauth_google', 'web3_metamask', 'oauth_github'];
      const lastAuthenticationStrategy: TestStrategy = 'web3_metamask';
      const maxStrategiesPerRow = 3;

      const result = distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, lastAuthenticationStrategy);

      expect(result).toEqual({
        strategyRows: [['web3_metamask'], ['oauth_google', 'oauth_github']],
        lastAuthenticationStrategyPresent: true,
      });
    });

    it('handles edge case with max strategies per row of 1', () => {
      const strategies: TestStrategy[] = ['oauth_google', 'oauth_facebook', 'oauth_github'];
      const lastAuthenticationStrategy: TestStrategy = 'oauth_facebook';
      const maxStrategiesPerRow = 1;

      const result = distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, lastAuthenticationStrategy);

      expect(result).toEqual({
        strategyRows: [['oauth_facebook'], ['oauth_google'], ['oauth_github']],
        lastAuthenticationStrategyPresent: true,
      });
    });
  });

  describe('without lastAuthenticationStrategy', () => {
    it('distributes strategies into a single row when count is less than or equal to max', () => {
      const strategies: TestStrategy[] = ['oauth_google', 'oauth_facebook'];
      const maxStrategiesPerRow = 3;

      const result = distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, null);

      expect(result).toEqual({
        strategyRows: [['oauth_google', 'oauth_facebook']],
        lastAuthenticationStrategyPresent: false,
      });
    });

    it('distributes strategies across multiple rows when count exceeds max', () => {
      const strategies: TestStrategy[] = [
        'oauth_google',
        'oauth_facebook',
        'oauth_github',
        'oauth_twitter',
        'oauth_apple',
      ];
      const maxStrategiesPerRow = 3;

      const result = distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, null);

      expect(result).toEqual({
        strategyRows: [
          ['oauth_google', 'oauth_facebook', 'oauth_github'],
          ['oauth_twitter', 'oauth_apple'],
        ],
        lastAuthenticationStrategyPresent: false,
      });
    });

    it('handles empty strategies array', () => {
      const strategies: TestStrategy[] = [];
      const maxStrategiesPerRow = 3;

      const result = distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, null);

      expect(result).toEqual({
        strategyRows: [[]],
        lastAuthenticationStrategyPresent: false,
      });
    });

    it('distributes strategies evenly across calculated number of rows', () => {
      const strategies: TestStrategy[] = [
        'oauth_google',
        'oauth_facebook',
        'oauth_github',
        'oauth_twitter',
        'oauth_apple',
        'oauth_discord',
        'oauth_spotify',
      ];
      const maxStrategiesPerRow = 3;

      const result = distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, null);

      expect(result).toEqual({
        strategyRows: [
          ['oauth_google', 'oauth_facebook', 'oauth_github'],
          ['oauth_twitter', 'oauth_apple', 'oauth_discord'],
          ['oauth_spotify'],
        ],
        lastAuthenticationStrategyPresent: false,
      });
    });
  });

  describe('edge cases', () => {
    it('handles single strategy with lastAuthenticationStrategy match', () => {
      const strategies: TestStrategy[] = ['oauth_google'];
      const lastAuthenticationStrategy: TestStrategy = 'oauth_google';
      const maxStrategiesPerRow = 1;

      const result = distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, lastAuthenticationStrategy);

      expect(result).toEqual({
        strategyRows: [['oauth_google']],
        lastAuthenticationStrategyPresent: true,
      });
    });

    it('maintains order of strategies when distributing', () => {
      const strategies: TestStrategy[] = ['strategy_a', 'strategy_b', 'strategy_c', 'strategy_d'];
      const maxStrategiesPerRow = 2;

      const result = distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, null);

      expect(result).toEqual({
        strategyRows: [
          ['strategy_a', 'strategy_b'],
          ['strategy_c', 'strategy_d'],
        ],
        lastAuthenticationStrategyPresent: false,
      });
    });

    it('preserves original strategies array when lastAuthenticationStrategy is not found', () => {
      const strategies: TestStrategy[] = ['oauth_google', 'oauth_facebook', 'oauth_github'];
      const originalStrategies = [...strategies];
      const lastAuthenticationStrategy: TestStrategy = 'oauth_nonexistent';
      const maxStrategiesPerRow = 3;

      distributeStrategiesIntoRows(strategies, maxStrategiesPerRow, lastAuthenticationStrategy);

      expect(strategies).toEqual(originalStrategies);
    });
  });
});
