import type { SetActiveNavigate } from '@clerk/shared/types';
import React, { useEffect, useRef, type ReactNode } from 'react';
import { useClerk, useSignIn, useSignUp } from '../hooks';

export interface HandleSSOCallbackProps {
  /**
   * Called when the SSO callback is complete and a session has been created.
   */
  navigateToApp: (...params: Parameters<SetActiveNavigate>) => void;
  /**
   * Called when a sign-in requires additional verification, or a sign-up is transfered to a sign-in that requires
   * additional verification.
   */
  navigateToSignIn: () => void;
  /**
   * Called when a sign-in is transfered to a sign-up that requires additional verification.
   */
  navigateToSignUp: () => void;
  /**
   * Can be provided to render a custom component while the SSO callback is being processed. This component should, at
   * a minimum, render a `<div id='clerk-captcha'></div>` element to handle captchas.
   */
  render?: () => ReactNode;
}

/**
 * Use this component when building custom UI to handle the SSO callback and navigate to the appropriate page based on
 * the status of the sign-in or sign-up. By default, this component might render a captcha element to handle captchas
 * when required by the Clerk API.
 *
 * @example
 * ```tsx
 * import { HandleSSOCallback } from '@clerk/react';
 * import { useNavigate } from 'react-router';
 *
 * export default function Page() {
 *   const navigate = useNavigate();
 *
 *   return (
 *     <HandleSSOCallback
 *       navigateToApp={({ session, decorateUrl }) => {
 *         if (session?.currentTask) {
 *           const destination = decorateUrl(`/onboarding/${session?.currentTask.key}`);
 *           if (destination.startsWith('http')) {
 *             window.location.href = destination;
 *             return;
 *           }
 *           navigate(destination);
 *           return;
 *         }
 *
 *         const destination = decorateUrl('/dashboard');
 *         if (destination.startsWith('http')) {
 *           window.location.href = destination;
 *           return;
 *         }
 *         navigate(destination);
 *       }}
 *       navigateToSignIn={() => {
 *         navigate('/sign-in');
 *       }}
 *       navigateToSignUp={() => {
 *         navigate('/sign-up');
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function HandleSSOCallback(props: HandleSSOCallbackProps): ReactNode {
  const { navigateToApp, navigateToSignIn, navigateToSignUp, render } = props;
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const hasRun = useRef(false);

  useEffect(() => {
    (async () => {
      if (!clerk.loaded || hasRun.current) {
        return;
      }
      // Prevent re-running this effect if the page is re-rendered during session activation (such as on Next.js).
      hasRun.current = true;

      // If this was a sign-in, and it's complete, there's nothing else to do.
      // Note: We perform a cast
      if ((signIn.status as string) === 'complete') {
        await signIn.finalize({
          navigate: async (...params) => {
            navigateToApp(...params);
          },
        });
        return;
      }

      // If the sign-up used an existing account, transfer it to a sign-in.
      if (signUp.isTransferable) {
        await signIn.create({ transfer: true });
        if (signIn.status === 'complete') {
          await signIn.finalize({
            navigate: async (...params) => {
              navigateToApp(...params);
            },
          });
          return;
        }
        // The sign-in requires additional verification, so we need to navigate to the sign-in page.
        return navigateToSignIn();
      }

      if (
        signIn.status === 'needs_first_factor' &&
        !signIn.supportedFirstFactors?.every(f => f.strategy === 'enterprise_sso')
      ) {
        // The sign-in requires the use of a configured first factor, so navigate to the sign-in page.
        return navigateToSignIn();
      }

      // If the sign-in used an external account not associated with an existing user, create a sign-up.
      if (signIn.isTransferable) {
        await signUp.create({ transfer: true });
        if (signUp.status === 'complete') {
          await signUp.finalize({
            navigate: async (...params) => {
              navigateToApp(...params);
            },
          });
          return;
        }
        return navigateToSignUp();
      }

      if (signUp.status === 'complete') {
        await signUp.finalize({
          navigate: async (...params) => {
            navigateToApp(...params);
          },
        });
        return;
      }

      if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_new_password') {
        // The sign-in requires a MFA token or a new password, so navigate to the sign-in page.
        return navigateToSignIn();
      }

      // The external account used to sign-in or sign-up was already associated with an existing user and active
      // session on this client, so activate the session and navigate to the application.
      if (signIn.existingSession || signUp.existingSession) {
        const sessionId = signIn.existingSession?.sessionId || signUp.existingSession?.sessionId;
        if (sessionId) {
          // Because we're activating a session that's not the result of a sign-in or sign-up, we need to use the
          // Clerk `setActive` API instead of the `finalize` API.
          await clerk.setActive({
            session: sessionId,
            navigate: async (...params) => {
              return navigateToApp(...params);
            },
          });
          return;
        }
      }
    })();
  }, [clerk, signIn, signUp]);

  if (render) {
    return render();
  }

  return (
    <div>
      {/* Because a sign-in transferred to a sign-up might require captcha verification, make sure to render the
  captcha element. */}
      <div id='clerk-captcha'></div>
    </div>
  );
}
