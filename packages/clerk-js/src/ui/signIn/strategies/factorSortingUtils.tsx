import { SignInFactor, SignInStrategy } from '@clerk/types';

const makeSortingOrderMap = <T extends string>(arr: T[]): Record<T, number> =>
  arr.reduce((acc, k, i) => {
    acc[k] = i;
    return acc;
  }, {} as Record<T, number>);

const STRATEGY_SORT_ORDER_PASSWORD_PREF = makeSortingOrderMap([
  'password',
  'email_link',
  'email_code',
  'phone_code',
] as SignInStrategy[]);

const STRATEGY_SORT_ORDER_OTP_PREF = makeSortingOrderMap([
  'email_link',
  'email_code',
  'phone_code',
  'password',
] as SignInStrategy[]);

const STRATEGY_SORT_ORDER_ALL_STRATEGIES_BUTTONS = makeSortingOrderMap([
  'email_link',
  'email_code',
  'phone_code',
  'password',
] as SignInStrategy[]);

const makeSortingFunction =
  (sortingMap: Record<SignInStrategy, number>) =>
  (a: SignInFactor, b: SignInFactor): number => {
    const orderA = sortingMap[a.strategy];
    const orderB = sortingMap[b.strategy];
    if (orderA === undefined || orderB === undefined) {
      return 0;
    }
    return orderA - orderB;
  };

export const passwordPrefFactorComparator = makeSortingFunction(STRATEGY_SORT_ORDER_PASSWORD_PREF);
export const otpPrefFactorComparator = makeSortingFunction(STRATEGY_SORT_ORDER_OTP_PREF);
export const allStrategiesButtonsComparator = makeSortingFunction(STRATEGY_SORT_ORDER_ALL_STRATEGIES_BUTTONS);
