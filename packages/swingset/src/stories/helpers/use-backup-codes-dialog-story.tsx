import type { UserProfileBackupCodesFlowState } from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import { UserProfileBackupCodesDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-backup-codes-dialog.view';
import { useState } from 'react';

const CODES = ['3k4p-7m2q', '9w6d-2x8n', '5t1r-8c4v', '7j3f-6h9s', '2b8m-4q1k', '6n5x-9p3d'];

export function useBackupCodesDialogStory() {
  const [state, setState] = useState<UserProfileBackupCodesFlowState | null>(null);

  return {
    openBackupCodesDialog: () =>
      setState({ step: 'codes', codes: CODES, copied: false, isSubmitting: false, errors: {} }),
    backupCodesDialog: state ? (
      <UserProfileBackupCodesDialogView
        open
        state={state}
        onOpenChange={open => {
          if (!open) {
            setState(null);
          }
        }}
        onRetry={() => setState({ step: 'codes', codes: CODES, copied: false, isSubmitting: false, errors: {} })}
        onCopy={() => {
          void navigator.clipboard?.writeText(CODES.join('\n'));
          setState(current => (current?.step === 'codes' ? { ...current, copied: true } : current));
        }}
        onDownload={() => {
          const url = URL.createObjectURL(new Blob([CODES.join('\n')], { type: 'text/plain' }));
          const link = document.createElement('a');
          link.href = url;
          link.download = 'clerk-backup-codes.txt';
          link.click();
          URL.revokeObjectURL(url);
        }}
        onPrint={() => window.print()}
      />
    ) : null,
  };
}
