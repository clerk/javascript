import { SignInEmailLinkFlowComplete } from '../../common/EmailLinkCompleteFlowCard';
import { useSignInContext } from '../../contexts';

/**
 * The SignIn tree's email-link verify route: the tab the verification link opened in.
 *
 * A `transferable` verification is consumed by the polling tab, never here. The banked account
 * transfer can be consumed exactly once and no signal available to this tab says whether the
 * polling tab is about to do it — `verifiedAtClient` does not match on a development instance
 * even when both tabs share a client. Two consumers means the loser's rejected create detaches
 * the winner's sign-up server-side, so this tab only points the user back to the original.
 */
export const SignInEmailLinkVerify = () => {
  const { afterSignInUrl } = useSignInContext();

  return (
    <SignInEmailLinkFlowComplete
      redirectUrlComplete={afterSignInUrl}
      redirectUrl='../factor-two'
    />
  );
};
