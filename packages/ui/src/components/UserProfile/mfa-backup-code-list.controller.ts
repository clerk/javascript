import { useEffect, useRef, useState } from 'react';

import { usePrintable } from '@/ui/common';
import { useClipboard } from '@/ui/hooks';

import type { MfaBackupCodeListProps, useMfaBackupCodeListModel } from './mfa-backup-code-list.model';

export const useMfaBackupCodeListController = (
  model: ReturnType<typeof useMfaBackupCodeListModel>,
  props: MfaBackupCodeListProps,
) => {
  const { print, printableProps } = usePrintable();
  const codes = props.backupCodes?.slice();
  const codeText = codes?.join(',') || '';
  const { onCopy, hasCopied } = useClipboard(codeText);
  const mounted = useRef(true);
  const current = useRef({ key: model.requestKey, codeText, downloads: new Set<() => void>() });
  if (current.current.key !== model.requestKey || current.current.codeText !== codeText) {
    current.current = { key: model.requestKey, codeText, downloads: new Set() };
  }
  const owner = current.current;
  const [copiedOwner, setCopiedOwner] = useState<object>();
  const canRun = () =>
    mounted.current && current.current === owner && model.hasUser && model.canRun() && !!codes?.length;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      for (const release of owner.downloads) {
        release();
      }
    };
  }, [owner]);

  const onDownloadTxtFile = () => {
    if (!canRun()) {
      return;
    }
    const element = document.createElement('a');
    const file = new Blob([txtFileContent(codes, model.applicationName, model.userIdentifier)], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(file);
    let timer: number | undefined;
    const release = () => {
      if (!owner.downloads.delete(release)) {
        return;
      }
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
      element.remove();
      URL.revokeObjectURL(url);
    };
    owner.downloads.add(release);
    element.href = url;
    element.download = `${model.applicationName}_backup_codes.txt`;
    try {
      document.body.appendChild(element);
      element.click();
      timer = window.setTimeout(release, 0);
    } catch (error) {
      release();
      throw error;
    } finally {
      element.remove();
    }
  };

  return {
    hasUser: model.hasUser && model.canRun(),
    applicationName: model.applicationName,
    userIdentifier: model.userIdentifier,
    subtitle: props.subtitle,
    backupCodes: codes,
    print: () => {
      if (canRun()) {
        print();
      }
    },
    printableProps,
    hasCopied: hasCopied && copiedOwner === owner,
    onCopy: () => {
      if (canRun()) {
        setCopiedOwner(owner);
        onCopy();
      }
    },
    onDownloadTxtFile,
  };
};

function txtFileContent(backupCodes: string[] | undefined, applicationName: string, userIdentifier: string): string {
  const sanitizedBackupCodes = backupCodes?.join('\n');
  return `These are your backup codes for ${applicationName} account ${userIdentifier}.\nStore them securely and keep them secret. Each code can only be used once.\n\n${sanitizedBackupCodes}`;
}
