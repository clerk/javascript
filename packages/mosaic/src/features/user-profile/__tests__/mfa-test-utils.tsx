import { vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileAddMfaDialog } from '../user-profile-add-mfa.dialog';
import type { UserProfileMfaSetupViewProps } from '../user-profile-mfa-setup.view';
import { UserProfileMfaSetupView } from '../user-profile-mfa-setup.view';

export function MfaSetupDialog(props: Partial<UserProfileMfaSetupViewProps>) {
  return (
    <MosaicProvider>
      <UserProfileAddMfaDialog
        open
        onOpenChange={vi.fn()}
      >
        <UserProfileMfaSetupView
          step='select'
          methods={['sms', 'authenticator', 'backup-codes']}
          onSelect={vi.fn()}
          onCancel={vi.fn()}
          authenticator={{
            onRetry: vi.fn(),
            code: '',
            onCodeChange: vi.fn(),
            onSubmit: vi.fn(),
          }}
          sms={{
            step: 'select',
            phoneNumbers: [],
            selectedPhoneId: '',
            onSelectedPhoneIdChange: vi.fn(),
            onAddPhone: vi.fn(),
            onBack: vi.fn(),
            phoneNumber: '',
            onPhoneNumberChange: vi.fn(),
            code: '',
            onCodeChange: vi.fn(),
            onSubmit: vi.fn(),
            onResend: vi.fn(),
          }}
          backupCodes={{
            codes: [],
            onRetry: vi.fn(),
            onCopy: vi.fn(),
            onDownload: vi.fn(),
          }}
          {...props}
        />
      </UserProfileAddMfaDialog>
    </MosaicProvider>
  );
}
