import type { SignInContextType, SignUpContextType } from 'ui/contexts';

// Check if the provided strategy is one of the SignUpContext or SignInContext
// disabled ones.
// This is only for internal use and shouldn't be exposed as a type.
export function shouldDisableStrategy<
  T extends SignUpContextType | SignInContextType
>(ctx: T, strategy: string): boolean {
  const { disabledStrategies } = ctx as T & { disabledStrategies: string[] };
  return disabledStrategies && disabledStrategies.includes(strategy);
}
