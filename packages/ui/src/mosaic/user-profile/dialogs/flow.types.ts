import type React from 'react';

/**
 * The contract between whatever drives a user-profile flow and the views that render it.
 *
 * Today the driver is a simulated backend in swingset; later it is a state machine plus its
 * Clerk controller. The views branch on `step`, never on the driver — so the swap is a rewire.
 *
 * Modelled off the legacy flows in `packages/ui/src/components/UserProfile`: `EmailForm`
 * (which picks between three verification strategies), `PhoneForm`, `VerifyWithCode`,
 * `VerifyWithLink`, and `RemoveResourceForm`.
 */

export type ContactKind = 'email' | 'phone';

/**
 * Verification strategies a contact can take. The choice is made from the environment and the
 * resource — instance-wide email links, or an address matching an enterprise connection — so it
 * belongs to the machine; only the destinations are rendered.
 */
export type ContactVerificationStrategy = 'email_code' | 'email_link' | 'enterprise_sso' | 'phone_code';

/** A field-attributable error (Clerk's `meta.paramName`) versus one with nowhere to go. */
export interface FlowErrors {
  /** Rendered in the field's error slot. */
  field?: string;
  /** Rendered above the form. Clerk errors without a `paramName` land here. */
  form?: string;
}

/** Resend affordance shared by the code and link steps. The link step's is throttled to 60s. */
export interface ResendState {
  isResending: boolean;
  /** Seconds left on the cooldown; `0` when resend is available. */
  secondsRemaining: number;
}

/** Terminal outcomes of an email-link verification. The polling itself is not rendered. */
export type EmailLinkOutcome = 'verified' | 'verified_other_tab' | 'expired' | 'failed';

export interface AddContactIdentifierStep {
  step: 'identifier';
  value: string;
  isSubmitting: boolean;
  errors: FlowErrors;
}

/**
 * Between creating the resource and the verification surface. Legacy hides this — it fires
 * `prepareVerification` from an effect beneath an already-rendered code screen — but under
 * simulated latency it is long enough to see, so it gets a state of its own.
 */
export interface AddContactPreparingStep {
  step: 'preparing';
  identifier: string;
  strategy: ContactVerificationStrategy;
}

export interface AddContactCodeStep {
  step: 'code';
  identifier: string;
  strategy: Extract<ContactVerificationStrategy, 'email_code' | 'phone_code'>;
  code: string;
  /** `success` holds briefly before the flow closes, so the check mark is visible. */
  status: 'idle' | 'verifying' | 'error' | 'success';
  errors: FlowErrors;
  resend: ResendState;
}

export interface AddContactLinkStep {
  step: 'link';
  identifier: string;
  resend: ResendState;
  /** Absent while waiting for the click. */
  outcome?: Exclude<EmailLinkOutcome, 'verified'>;
  errors: FlowErrors;
}

export interface AddContactSsoStep {
  step: 'sso';
  identifier: string;
  providerName: string;
  status: 'idle' | 'awaiting_popup' | 'error';
  errors: FlowErrors;
}

export interface AddContactSuccessStep {
  step: 'success';
  identifier: string;
}

export type AddContactFlowState =
  | AddContactIdentifierStep
  | AddContactPreparingStep
  | AddContactCodeStep
  | AddContactLinkStep
  | AddContactSsoStep
  | AddContactSuccessStep;

/** Events the add-contact views send back. Named as the machine will name them. */
export interface AddContactFlowActions {
  onValueChange: (value: string) => void;
  onSubmitIdentifier: () => void;
  onCodeChange: (code: string) => void;
  onSubmitCode: () => void;
  onResend: () => void;
  onOpenSsoPopup: () => void;
  onCancel: () => void;
}

/**
 * A destructive confirmation. `messageLine2` is only present for a verified contact — legacy
 * suppresses the "you will no longer be able to sign in" line on an unverified one.
 */
export interface ConfirmContactActionState {
  identifier: string;
  isSubmitting: boolean;
  errors: FlowErrors;
}

/**
 * A reverification challenge raised mid-mutation. Rendered stacked over the flow it interrupted,
 * which stays open and pending behind it; on success the original flow resumes where it left off.
 */
export interface ReverificationChallengeState {
  strategy: 'password' | 'email_code' | 'phone_code' | 'passkey' | 'totp' | 'backup_code';
  /** The address or number a code was sent to. Absent for the password strategy. */
  identifier?: string;
  value: string;
  status: 'idle' | 'verifying' | 'error';
  errors: FlowErrors;
  resend: ResendState;
}

export interface ReverificationChallengeActions {
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  onCancel: () => void;
}

// =============================================================================
// Profile fields — name, username, avatar
// =============================================================================
// Single-step forms, unlike the contact flows. Modelled off the legacy `ProfileForm`,
// `UsernameForm`, and `AvatarUploader`.

export interface EditNameState {
  firstName: string;
  lastName: string;
  isSubmitting: boolean;
  /**
   * An account with an active enterprise connection cannot edit its own name — legacy renders an
   * information box and disables the fields rather than hiding the form.
   */
  isReadOnly: boolean;
  errors: FlowErrors & { firstName?: string; lastName?: string };
}

export interface EditNameActions {
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export interface EditUsernameState {
  value: string;
  /** Legacy titles the form `set` versus `update` depending on whether one exists already. */
  hasUsername: boolean;
  isSubmitting: boolean;
  errors: FlowErrors;
}

export interface EditUsernameActions {
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/** Why a chosen file was rejected before any upload was attempted. */
export type AvatarRejection = 'type' | 'size';

export interface EditAvatarState {
  /** What the preview shows: the staged file if there is one, otherwise the current image. */
  previewUrl?: string;
  /** Name of the staged file. Absent when nothing is staged. */
  fileName?: string;
  /** Whether a non-default image exists to remove. */
  canRemove: boolean;
  status: 'idle' | 'uploading' | 'removing';
  errors: FlowErrors;
}

export interface EditAvatarActions {
  onSelectFile: (file: File) => void;
  onSubmit: () => void;
  onRemove: () => void;
  onCancel: () => void;
}

/** Which profile field a dialog is editing. */
export type ProfileField = 'name' | 'username' | 'avatar';

// =============================================================================
// What the section view takes
// =============================================================================
// The view renders the dialogs; it does not decide when they are open. Each prop below is the
// flow's snapshot plus its events, or `null` when that flow is not running — the view derives
// both the dialog's `open` and its held exit frame from that. This mirrors the UserButton, whose
// view renders the whole popover but forwards `open` straight through: the surface belongs to the
// view, the state driving it does not.

export interface EditProfileDialogActions {
  onNameChange: (key: 'firstName' | 'lastName', value: string) => void;
  onUsernameChange: (value: string) => void;
  onSelectAvatarFile: (file: File) => void;
  onRemoveAvatar: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export type EditProfileFlow = EditProfileDialogActions &
  (
    | { field: 'name'; state: EditNameState }
    | { field: 'username'; state: EditUsernameState }
    | { field: 'avatar'; state: EditAvatarState }
  );

export interface ConfirmContactDialogActions {
  onConfirm: () => void;
  onCancel: () => void;
}

export type ConfirmContactFlow = ConfirmContactDialogActions & {
  action: 'remove' | 'set-primary';
  kind: ContactKind;
  /** Drives whether the removal warns about losing sign-in. */
  isVerified: boolean;
  state: ConfirmContactActionState;
};

export type AddContactFlow = AddContactFlowActions & {
  kind: ContactKind;
  state: AddContactFlowState;
};

export type ReverificationFlow = ReverificationChallengeActions & {
  state: ReverificationChallengeState;
};

/** The flow half of the account section's props. Every field is optional and nullable. */
export interface AccountSectionFlows {
  /**
   * Where focus returns when a dialog closes. These dialogs open from state rather than from a
   * `Dialog.Trigger`, so without it focus lands on the body and the row is lost.
   */
  flowTriggerRef?: React.RefObject<HTMLElement | null>;
  addContact?: AddContactFlow | null;
  confirmContact?: ConfirmContactFlow | null;
  editProfile?: EditProfileFlow | null;
  /** Stacks over whichever flow raised it. Shared across sections; it lives here until a second one needs it. */
  reverification?: ReverificationFlow | null;
}

export interface UserProfilePasswordValues {
  newPassword: string;
  confirmPassword: string;
  signOutOfOtherSessions: boolean;
}

export type UserProfilePasswordField = keyof UserProfilePasswordValues;
export type UserProfilePasswordMode = 'change' | 'set';

export interface UserProfilePasswordFlowState {
  mode: UserProfilePasswordMode;
  values: UserProfilePasswordValues;
  isSubmitting: boolean;
  errors: FlowErrors & Partial<Record<UserProfilePasswordField, string>>;
}

export interface UserProfileDeleteAccountFlowState {
  confirmation: string;
  isSubmitting: boolean;
  errors: FlowErrors;
}

export interface UserProfileSignOutAllDevicesFlowState {
  isSubmitting: boolean;
  errors: FlowErrors;
}
