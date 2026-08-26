import type {
  ReverificationChallengeState,
  UserProfileBackupCodesFlowState,
  UserProfileDeleteAccountFlowState,
  UserProfileDeviceDetailsFlowState,
  UserProfileMfaAddFlowState,
  UserProfileMfaRemoveFlowState,
  UserProfilePasskeyCreationState,
  UserProfilePasskeyRemoveFlowState,
  UserProfilePasskeyRenameFlowState,
  UserProfilePasswordFlowState,
  UserProfileSignOutAllDevicesFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';

interface StateByFlow {
  password: UserProfilePasswordFlowState;
  'add-passkey': UserProfilePasskeyCreationState;
  'rename-passkey': UserProfilePasskeyRenameFlowState;
  'remove-passkey': UserProfilePasskeyRemoveFlowState;
  'add-mfa': UserProfileMfaAddFlowState;
  'remove-mfa': UserProfileMfaRemoveFlowState;
  'backup-codes': UserProfileBackupCodesFlowState;
  'delete-account': UserProfileDeleteAccountFlowState;
  device: UserProfileDeviceDetailsFlowState;
  'sign-out-all-devices': UserProfileSignOutAllDevicesFlowState;
}

type SecurityFlow = keyof StateByFlow;
type SnapshotFor<Flow extends SecurityFlow> = {
  flow: Flow;
  step: string;
  variant: string;
  state: StateByFlow[Flow];
  reverification?: ReverificationChallengeState;
};

export type SecuritySnapshot = { [Flow in SecurityFlow]: SnapshotFor<Flow> }[SecurityFlow];

type SnapshotEntry<Flow extends SecurityFlow> = readonly [
  variant: string,
  state: StateByFlow[Flow],
  reverification?: ReverificationChallengeState,
];

function group<Flow extends SecurityFlow>(
  flow: Flow,
  step: string,
  entries: readonly SnapshotEntry<Flow>[],
): SnapshotFor<Flow>[] {
  return entries.map(([variant, state, reverification]) => ({ flow, step, variant, state, reverification }));
}

const FORM_ERROR = { form: 'Something went wrong. Please try again.' };
const FIELD_ERROR = { field: 'Incorrect code. Please try again.' };
const IDLE_RESEND = { isResending: false, secondsRemaining: 0 };
const BACKUP_CODES = ['3k4p-7m2q', '9w6d-2x8n', '5t1r-8c4v', '7j3f-6h9s', '2b8m-4q1k', '6n5x-9p3d'];

const idleVerification: ReverificationChallengeState = {
  strategy: 'email_code',
  identifier: 'i••••@clerk.dev',
  value: '',
  status: 'idle',
  errors: {},
  resend: IDLE_RESEND,
};

const passwordValues = {
  newPassword: 'correct-horse',
  confirmPassword: 'correct-horse',
  signOutOfOtherSessions: true,
};
const password = (overrides: Partial<UserProfilePasswordFlowState> = {}): UserProfilePasswordFlowState => ({
  mode: 'change',
  values: passwordValues,
  isSubmitting: false,
  errors: {},
  ...overrides,
});
const pendingPassword = password({ isSubmitting: true });

const passkeyCreation = (
  overrides: Partial<UserProfilePasskeyCreationState> = {},
): UserProfilePasskeyCreationState => ({ isSubmitting: false, errors: {}, ...overrides });
const renamePasskey = (
  overrides: Partial<UserProfilePasskeyRenameFlowState> = {},
): UserProfilePasskeyRenameFlowState => ({
  id: 'passkey',
  originalName: 'Passkey',
  name: 'Chrome on macOS',
  isSubmitting: false,
  errors: {},
  ...overrides,
});
const removePasskey = (
  overrides: Partial<UserProfilePasskeyRemoveFlowState> = {},
): UserProfilePasskeyRemoveFlowState => ({
  id: 'passkey',
  name: 'Chrome on macOS',
  isSubmitting: false,
  errors: {},
  ...overrides,
});

type AddMfaState<
  Method extends UserProfileMfaAddFlowState['method'],
  Step extends UserProfileMfaAddFlowState['step'],
> = Extract<UserProfileMfaAddFlowState, { method: Method; step: Step }>;
type AddMfaStep<Step extends UserProfileMfaAddFlowState['step']> = Extract<UserProfileMfaAddFlowState, { step: Step }>;
const smsSelectPhone = (
  overrides: Partial<AddMfaState<'sms', 'select-phone'>> = {},
): AddMfaState<'sms', 'select-phone'> => ({
  method: 'sms',
  step: 'select-phone',
  phones: [],
  isSubmitting: false,
  errors: {},
  ...overrides,
});
const smsPhone = (overrides: Partial<AddMfaState<'sms', 'phone'>> = {}): AddMfaState<'sms', 'phone'> => ({
  method: 'sms',
  step: 'phone',
  phoneNumber: '+1',
  isSubmitting: false,
  errors: {},
  ...overrides,
});
const smsPreparing = (
  overrides: Partial<AddMfaState<'sms', 'preparing-sms'>> = {},
): AddMfaState<'sms', 'preparing-sms'> => ({
  method: 'sms',
  step: 'preparing-sms',
  identifier: '+1 801 555 0100',
  returnStep: 'phone',
  isSubmitting: true,
  errors: {},
  ...overrides,
});
const smsVerify = (overrides: Partial<AddMfaStep<'verify'>> = {}): AddMfaStep<'verify'> => ({
  method: 'sms',
  step: 'verify',
  identifier: '+1 801 555 0100',
  code: '',
  status: 'idle',
  resend: IDLE_RESEND,
  isSubmitting: false,
  errors: {},
  ...overrides,
});
const authenticatorPreparing = (
  overrides: Partial<AddMfaState<'authenticator', 'preparing'>> = {},
): AddMfaState<'authenticator', 'preparing'> => ({
  method: 'authenticator',
  step: 'preparing',
  isSubmitting: true,
  errors: {},
  ...overrides,
});
const authenticatorSetup = (
  overrides: Partial<AddMfaState<'authenticator', 'setup'>> = {},
): AddMfaState<'authenticator', 'setup'> => ({
  method: 'authenticator',
  step: 'setup',
  displayFormat: 'qr',
  secret: 'JBSWY3DPEHPK3PXP',
  uri: 'otpauth://totp/Clerk:preston@clerk.dev?secret=JBSWY3DPEHPK3PXP&issuer=Clerk',
  isSubmitting: false,
  errors: {},
  ...overrides,
});
const authenticatorVerify = (overrides: Partial<AddMfaStep<'verify'>> = {}): AddMfaStep<'verify'> => ({
  method: 'authenticator',
  step: 'verify',
  code: '',
  status: 'idle',
  resend: IDLE_RESEND,
  isSubmitting: false,
  errors: {},
  ...overrides,
});
const enrollmentBackupCodes = (overrides: Partial<AddMfaStep<'backup-codes'>> = {}): AddMfaStep<'backup-codes'> => ({
  method: 'authenticator',
  step: 'backup-codes',
  codes: BACKUP_CODES,
  copied: false,
  isSubmitting: false,
  errors: {},
  ...overrides,
});

const removeMfa = (overrides: Partial<UserProfileMfaRemoveFlowState> = {}): UserProfileMfaRemoveFlowState => ({
  method: 'authenticator',
  id: 'authenticator',
  label: 'Authenticator app',
  isSubmitting: false,
  errors: {},
  ...overrides,
});
const deleteAccount = (
  overrides: Partial<UserProfileDeleteAccountFlowState> = {},
): UserProfileDeleteAccountFlowState => ({ confirmation: '', isSubmitting: false, errors: {}, ...overrides });
const signOutAll = (
  overrides: Partial<UserProfileSignOutAllDevicesFlowState> = {},
): UserProfileSignOutAllDevicesFlowState => ({ isSubmitting: false, errors: {}, ...overrides });

const deviceDetails: UserProfileDeviceDetailsFlowState['device'] = {
  id: 'desktop',
  title: 'Macbook Pro · Chrome',
  lastActiveAtLabel: 'Last active 4 days ago',
  deviceName: 'Macbook Pro',
  browserName: 'Chrome 150.0.0.0',
  ipAddress: '2600:100e:b10b:787b:e8ae:6e75:fc2f:b10',
  location: 'Salt Lake City, UT, United States',
  locationFlag: '🇺🇸',
  originalSignInAtLabel: 'July 5th, 2026',
};
const device = (overrides: Partial<UserProfileDeviceDetailsFlowState> = {}): UserProfileDeviceDetailsFlowState => ({
  device: deviceDetails,
  isSubmitting: false,
  errors: {},
  ...overrides,
});

export const SECURITY_FLOW_SNAPSHOTS: readonly SecuritySnapshot[] = [
  ...group('password', 'password', [
    ['change', password({ values: { ...passwordValues, newPassword: '', confirmPassword: '' } })],
    [
      'current password required',
      password({
        values: { ...passwordValues, currentPassword: '', newPassword: '', confirmPassword: '' },
        requiresCurrentPassword: true,
        signedInIdentifier: 'preston@clerk.dev',
        minimumLength: 8,
      }),
    ],
    ['set', password({ mode: 'set', values: { ...passwordValues, newPassword: '', confirmPassword: '' } })],
    [
      'mismatch',
      password({
        values: { ...passwordValues, confirmPassword: 'different-password' },
        errors: { confirmPassword: 'Passwords do not match.' },
      }),
    ],
    [
      'password requirement',
      password({
        values: { ...passwordValues, newPassword: 'short', confirmPassword: 'short' },
        minimumLength: 8,
        errors: { newPassword: 'Your password must contain 8 or more characters.' },
      }),
    ],
    [
      'enterprise managed',
      password({ values: { ...passwordValues, newPassword: '', confirmPassword: '' }, isReadOnly: true }),
    ],
    ['submitting', pendingPassword],
    ['server error', password({ errors: FORM_ERROR })],
    ['reverification', pendingPassword, idleVerification],
  ]),
  ...group('password', 'reverification', [
    [
      'choose first factor',
      pendingPassword,
      {
        ...idleVerification,
        step: 'select-first-factor',
        availableFactors: [
          { id: 'password', strategy: 'password', label: 'Password' },
          { id: 'email', strategy: 'email_code', label: 'Email code', identifier: 'i••••@clerk.dev' },
          { id: 'passkey', strategy: 'passkey', label: 'Passkey' },
        ],
      },
    ],
    ['preparing code', pendingPassword, { ...idleVerification, step: 'prepare', preparationStatus: 'preparing' }],
    [
      'preparation error',
      pendingPassword,
      {
        ...idleVerification,
        step: 'prepare',
        preparationStatus: 'error',
        errors: { form: 'Could not send a verification code.' },
      },
    ],
    [
      'choose second factor',
      pendingPassword,
      {
        ...idleVerification,
        step: 'select-second-factor',
        stage: 'second',
        availableFactors: [
          { id: 'totp', strategy: 'totp', label: 'Authenticator app' },
          { id: 'phone', strategy: 'phone_code', label: 'Phone code', identifier: '+1 ••• ••• 4242' },
          { id: 'backup', strategy: 'backup_code', label: 'Backup code' },
        ],
      },
    ],
    ['no methods', pendingPassword, { ...idleVerification, step: 'unavailable' }],
    ['having trouble', pendingPassword, { ...idleVerification, step: 'help' }],
    ['verifying', pendingPassword, { ...idleVerification, value: '424242', status: 'verifying' }],
    ['wrong code', pendingPassword, { ...idleVerification, status: 'error', errors: FIELD_ERROR }],
    ['server error', pendingPassword, { ...idleVerification, value: '424242', status: 'error', errors: FORM_ERROR }],
  ]),
  ...group('add-passkey', 'add passkey', [
    ['idle', passkeyCreation()],
    ['submitting', passkeyCreation({ isSubmitting: true })],
    [
      'unsupported',
      passkeyCreation({
        capability: 'unsupported',
        result: 'idle',
        errors: { form: 'Passkeys are not supported by this browser or device.' },
      }),
    ],
    [
      'cancelled',
      passkeyCreation({
        capability: 'available',
        result: 'cancelled',
        errors: { form: 'Passkey creation was cancelled.' },
      }),
    ],
    ['server error', passkeyCreation({ errors: FORM_ERROR })],
    [
      'resource error',
      passkeyCreation({
        capability: 'available',
        result: 'resource-error',
        errors: { form: 'The passkey could not be created. Please try again.' },
      }),
    ],
    ['reverification', passkeyCreation({ isSubmitting: true }), idleVerification],
  ]),
  ...group('rename-passkey', 'rename passkey', [
    ['unchanged', renamePasskey({ name: 'Passkey' })],
    ['ready', renamePasskey()],
    ['submitting', renamePasskey({ isSubmitting: true })],
    ['server error', renamePasskey({ errors: FORM_ERROR })],
    ['field error', renamePasskey({ errors: { field: 'This passkey name is unavailable.' } })],
  ]),
  ...group('remove-passkey', 'remove passkey', [
    ['idle', removePasskey()],
    ['submitting', removePasskey({ isSubmitting: true })],
    ['server error', removePasskey({ errors: FORM_ERROR })],
  ]),
  ...group('add-mfa', 'choose phone', [
    [
      'existing numbers',
      smsSelectPhone({
        phones: [
          { id: 'verified', label: '+1 801-888-8181', isVerified: true },
          { id: 'unverified', label: '+1 801-555-0100', isVerified: false },
        ],
      }),
    ],
    [
      'enabling existing',
      smsSelectPhone({
        phones: [{ id: 'verified', label: '+1 801-888-8181', isVerified: true }],
        loadingPhoneId: 'verified',
        isSubmitting: true,
      }),
    ],
  ]),
  ...group('add-mfa', 'add phone', [
    ['phone number', smsPhone()],
    ['submitting', smsPhone({ phoneNumber: '+1 801 555 0100', isSubmitting: true })],
  ]),
  ...group('add-mfa', 'verify phone', [
    ['code', smsVerify()],
    ['preparing', smsPreparing()],
    [
      'preparation error',
      smsPreparing({ isSubmitting: false, errors: { form: 'Could not send a verification code.' } }),
    ],
    ['resend cooldown', smsVerify({ resend: { isResending: false, secondsRemaining: 24 }, returnStep: 'phone' })],
    ['resending', smsVerify({ resend: { isResending: true, secondsRemaining: 0 }, returnStep: 'phone' })],
    ['verifying', smsVerify({ code: '424242', status: 'verifying', isSubmitting: true })],
    ['wrong code', smsVerify({ status: 'error', errors: FIELD_ERROR })],
    ['reverification', smsVerify({ code: '424242', status: 'verifying', isSubmitting: true }), idleVerification],
  ]),
  ...group('add-mfa', 'add authenticator', [
    ['preparing', authenticatorPreparing()],
    ['preparation error', authenticatorPreparing({ isSubmitting: false, errors: FORM_ERROR })],
    ['QR code', authenticatorSetup()],
    ['setup key', authenticatorSetup({ displayFormat: 'key', copied: true })],
  ]),
  ...group('add-mfa', 'verify authenticator', [
    ['code', authenticatorVerify()],
    ['wrong code', authenticatorVerify({ status: 'error', errors: FIELD_ERROR })],
    ['server error', authenticatorVerify({ code: '424242', status: 'error', errors: FORM_ERROR })],
  ]),
  ...group('add-mfa', 'backup codes after enrollment', [
    ['ready', enrollmentBackupCodes()],
    ['copied', enrollmentBackupCodes({ copied: true })],
  ]),
  ...group('remove-mfa', 'remove method', [
    ['phone number', removeMfa({ method: 'sms', id: 'sms', label: '+1 801-888-8181' })],
    ['submitting', removeMfa({ isSubmitting: true })],
    ['authenticator', removeMfa()],
    ['server error', removeMfa({ errors: FORM_ERROR })],
  ]),
  ...group('backup-codes', 'backup codes', [
    ['generating', { step: 'generating', isSubmitting: true, errors: {} }],
    ['server error', { step: 'generating', isSubmitting: false, errors: FORM_ERROR }],
    ['reverification', { step: 'generating', isSubmitting: true, errors: {} }, idleVerification],
  ]),
  ...group('backup-codes', 'new codes', [
    ['ready', { step: 'codes', codes: BACKUP_CODES, isSubmitting: false, errors: {} }],
    ['unavailable', { step: 'unavailable', isSubmitting: false, errors: {} }],
  ]),
  ...group('delete-account', 'delete account', [
    ['idle', deleteAccount()],
    ['ready', deleteAccount({ confirmation: 'Delete account' })],
    ['submitting', deleteAccount({ confirmation: 'Delete account', isSubmitting: true })],
    ['server error', deleteAccount({ confirmation: 'Delete account', errors: FORM_ERROR })],
    ['reverification', deleteAccount({ confirmation: 'Delete account', isSubmitting: true }), idleVerification],
  ]),
  ...group('device', 'device', [
    ['details', device()],
    ['submitting', device({ isSubmitting: true })],
    ['server error', device({ errors: FORM_ERROR })],
    ['reverification', device({ isSubmitting: true }), idleVerification],
  ]),
  ...group('sign-out-all-devices', 'sign out all', [
    ['idle', signOutAll()],
    ['submitting', signOutAll({ isSubmitting: true })],
    ['server error', signOutAll({ errors: FORM_ERROR })],
    ['reverification', signOutAll({ isSubmitting: true }), idleVerification],
  ]),
];
