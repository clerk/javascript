import { lazy } from 'react';

const preloadSignUp = () => import(/* webpackChunkName: "signUp" */ '../SignUp');

const LazySignUpVerifyPhone = lazy(() => preloadSignUp().then(m => ({ default: m.SignUpVerifyPhone })));
const LazySignUpVerifyEmail = lazy(() => preloadSignUp().then(m => ({ default: m.SignUpVerifyEmail })));
const LazySignUpStart = lazy(() => preloadSignUp().then(m => ({ default: m.SignUpStart })));
const LazySignUpSSOCallback = lazy(() => preloadSignUp().then(m => ({ default: m.SignUpSSOCallback })));
const LazySignUpContinue = lazy(() => preloadSignUp().then(m => ({ default: m.SignUpContinue })));
const LazySignUpCurrentTask = lazy(() => preloadSignUp().then(m => ({ default: m.SignUpCurrentTask })));

const lazyCompleteSignUpFlow = () =>
  import(/* webpackChunkName: "signUp" */ '../SignUp/util').then(m => m.completeSignUpFlow);

export {
  lazyCompleteSignUpFlow,
  LazySignUpContinue,
  LazySignUpCurrentTask,
  LazySignUpSSOCallback,
  LazySignUpStart,
  LazySignUpVerifyEmail,
  LazySignUpVerifyPhone,
  preloadSignUp,
};
