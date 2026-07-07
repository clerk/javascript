import { lazy } from 'react';

const preloadSignUp = () => import(/* webpackChunkName: "signup" */ '../SignUp');

const LazySignUpVerifyPhone = lazy(() => preloadSignUp().then(m => ({ default: m.SignUpVerifyPhone })));
const LazySignUpVerifyEmail = lazy(() => preloadSignUp().then(m => ({ default: m.SignUpVerifyEmail })));
const LazySignUpStart = lazy(() => preloadSignUp().then(m => ({ default: m.SignUpStart })));
const LazySignUpSSOCallback = lazy(() => preloadSignUp().then(m => ({ default: m.SignUpSSOCallback })));
const LazySignUpContinue = lazy(() => preloadSignUp().then(m => ({ default: m.SignUpContinue })));
const LazySignUpProtectCheck = lazy(() => preloadSignUp().then(m => ({ default: m.SignUpProtectCheck })));

const lazyCompleteSignUpFlow = () =>
  import(/* webpackChunkName: "signup" */ '../SignUp/util').then(m => m.completeSignUpFlow);

export {
  preloadSignUp,
  LazySignUpVerifyPhone,
  LazySignUpVerifyEmail,
  LazySignUpStart,
  LazySignUpSSOCallback,
  LazySignUpContinue,
  LazySignUpProtectCheck,
  lazyCompleteSignUpFlow,
};
