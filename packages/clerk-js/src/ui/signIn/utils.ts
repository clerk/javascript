import { PreferredSignInStrategy, SignInFactor, SignInResource, SignInStrategy } from '@clerk/types';

import { PREFERRED_SIGN_IN_STRATEGIES } from '../../ui/common/constants';
import { otpPrefFactorComparator, passwordPrefFactorComparator } from '../../ui/signIn/strategies/factorSortingUtils';
import { titleize } from '../../v4/shared';

const FONT_SIZE_STEP = 2;

// creates a hidden element and returns what the text's width
// would be if it were rendered inside the parent
function textWidthForCurrentSize(text: string, parent: HTMLElement) {
  const hiddenTextContainer = document.createElement('div');
  hiddenTextContainer.style.position = 'absolute';
  hiddenTextContainer.style.left = '-99in';
  hiddenTextContainer.style.whiteSpace = 'nowrap';
  hiddenTextContainer.innerHTML = text;

  parent.appendChild(hiddenTextContainer);
  const result = hiddenTextContainer.clientWidth;
  parent.removeChild(hiddenTextContainer);
  return result;
}

export function fitTextInOneLine(text: string, containerEl: HTMLElement, defaultSize: string): void {
  const getContainerFontSize = () => window.getComputedStyle(containerEl).getPropertyValue('font-size');
  const decreaseSize = () => {
    const fontSizeWithUnit = getContainerFontSize();
    const newSize = (Number.parseInt(fontSizeWithUnit) - FONT_SIZE_STEP) * 0.85;
    containerEl.style.fontSize = newSize + 'px';
  };
  const increaseSize = () => {
    const fontSizeWithUnit = getContainerFontSize();
    const newSize = Number.parseInt(fontSizeWithUnit) + FONT_SIZE_STEP / 2;
    containerEl.style.fontSize = newSize + 'px';
  };

  containerEl.style.fontSize = defaultSize;
  while (textWidthForCurrentSize(text, containerEl) > containerEl.clientWidth) {
    decreaseSize();
  }

  if (
    getContainerFontSize() >= defaultSize ||
    textWidthForCurrentSize(text, containerEl) > containerEl.clientWidth * 0.75
  ) {
    return;
  }

  while (textWidthForCurrentSize(text, containerEl) < containerEl.clientWidth) {
    increaseSize();
  }
}

const factorForIdentifier = (i: string | null) => (f: SignInFactor) => {
  return 'safeIdentifier' in f && f.safeIdentifier === i;
};

function determineStrategyWhenPasswordIsPreferred(
  factors: SignInFactor[],
  identifier: string | null,
): SignInFactor | null {
  const selected = factors.sort(passwordPrefFactorComparator)[0];
  if (selected.strategy === 'password') {
    return selected;
  }
  return factors.find(factorForIdentifier(identifier)) || selected || null;
}

function determineStrategyWhenOTPIsPreferred(factors: SignInFactor[], identifier: string | null): SignInFactor | null {
  const sortedBasedOnPrefFactor = factors.sort(otpPrefFactorComparator);
  const forIdentifier = sortedBasedOnPrefFactor.find(factorForIdentifier(identifier));
  if (forIdentifier) {
    return forIdentifier;
  }
  const firstBasedOnPref = sortedBasedOnPrefFactor[0];
  if (firstBasedOnPref.strategy === 'email_link') {
    return firstBasedOnPref;
  }
  return factors.find(factorForIdentifier(identifier)) || firstBasedOnPref || null;
}

// The algorithm can be found at
// https://www.notion.so/clerkdev/Implement-sign-in-alt-methods-e6e60ffb644645b3a0553b50556468ce
export function determineStartingSignInFactor(
  firstFactors: SignInFactor[],
  identifier: string | null,
  preferredSignInStrategy: PreferredSignInStrategy,
): SignInFactor | null | undefined {
  if (!firstFactors || firstFactors.length === 0) {
    return null;
  }

  return preferredSignInStrategy === PREFERRED_SIGN_IN_STRATEGIES.Password
    ? determineStrategyWhenPasswordIsPreferred(firstFactors, identifier)
    : determineStrategyWhenOTPIsPreferred(firstFactors, identifier);
}

export function determineSalutation(signIn: Partial<SignInResource>): string {
  if (!signIn) {
    return '';
  }

  return titleize(signIn.userData?.firstName) || titleize(signIn.userData?.lastName) || signIn?.identifier || '';
}

const localStrategies: SignInStrategy[] = ['email_code', 'password', 'phone_code', 'email_link'];
export function factorHasLocalStrategy(factor: SignInFactor | undefined | null): boolean {
  if (!factor) {
    return false;
  }
  return localStrategies.includes(factor.strategy);
}
