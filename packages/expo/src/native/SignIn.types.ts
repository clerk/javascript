export type SignInMode = 'signIn' | 'signUp' | 'signInOrUp';

export interface SignInProps {
  /**
   * Authentication mode
   * @default 'signInOrUp'
   */
  mode?: SignInMode;

  /**
   * Whether the view can be dismissed
   * @default true
   */
  isDismissable?: boolean;

  /**
   * Called when authentication completes successfully
   */
  onSuccess?: () => void;

  /**
   * Called when an error occurs
   */
  onError?: (error: any) => void;
}
