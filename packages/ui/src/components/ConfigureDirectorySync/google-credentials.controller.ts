import { useCallback, useEffect, useRef, useState } from 'react';

import { isEmail } from '@/ui/utils/emailUtils';

import type { useGoogleCredentialsModel } from './google-credentials.model';
import type { GoogleCredentialsState } from './GoogleCredentialsForm';

type CredentialInput = {
  version: number;
  revision: number;
  serviceAccountJson: string;
  fileName: string | null;
  subjectEmail: string;
  fileError: string | null;
};
const emptyInput = (version: number): CredentialInput => ({
  version,
  revision: 0,
  serviceAccountJson: '',
  fileName: null,
  subjectEmail: '',
  fileError: null,
});

export const useGoogleCredentialsController = (
  model: ReturnType<typeof useGoogleCredentialsModel>,
): GoogleCredentialsState => {
  const { isConfigured, invalidKeyFileMessage, readFile, setCredentials, canRun } = model;
  const configured = useRef(isConfigured);
  configured.current = isConfigured;
  const mounted = useRef(true);
  const scope = useRef({ key: model.requestKey, version: 0 });
  if (scope.current.key !== model.requestKey) {
    scope.current = { key: model.requestKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const isCurrent = useCallback(
    () => mounted.current && scope.current.version === version && canRun(),
    [version, canRun],
  );
  const [input, setInput] = useState(() => emptyInput(version));
  const currentInput = useRef<CredentialInput | null>(input);
  const selectedRead = useRef<object | null>(null);
  const pendingSubmit = useRef<object | null>(null);
  if (input.version !== version) {
    const cleared = emptyInput(version);
    currentInput.current = cleared;
    setInput(cleared);
  } else {
    currentInput.current = input;
  }
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      currentInput.current = null;
      selectedRead.current = null;
      pendingSubmit.current = null;
    };
  }, [model.requestKey]);
  const changeInput = useCallback(
    (change: (previous: CredentialInput) => CredentialInput) => {
      if (!isCurrent()) {
        return;
      }
      const next = change(currentInput.current ?? emptyInput(version));
      currentInput.current = next;
      setInput(next);
    },
    [isCurrent, version],
  );
  const trimmedSubjectEmail = input.subjectEmail.trim();
  // Continue lives outside the form, so the input's type='email' never triggers
  // native validation. Without this, whitespace alone enables it.
  const hasPendingCredential = Boolean(input.serviceAccountJson) && isEmail(trimmedSubjectEmail);

  const selectFile = useCallback(
    async (file: File | undefined): Promise<void> => {
      if (!file || !isCurrent()) {
        return;
      }
      const readOwner = {};
      selectedRead.current = readOwner;
      // Drop whatever was selected before reading: a failed read must not leave
      // the previous key staged and submittable.
      changeInput(previous => ({
        ...previous,
        revision: previous.revision + 1,
        serviceAccountJson: '',
        fileName: null,
        fileError: null,
      }));
      try {
        const key = await readFile(file);
        if (!isCurrent() || selectedRead.current !== readOwner) {
          return;
        }
        const serviceAccountJson = JSON.stringify(key);
        changeInput(previous => ({
          ...previous,
          revision: previous.revision + 1,
          serviceAccountJson,
          fileName: file.name,
        }));
      } catch {
        // Catch the obvious wrong-file case here; anything structurally valid is
        // the identity provider's to judge, and its message is better than ours.
        if (isCurrent() && selectedRead.current === readOwner) {
          changeInput(previous => ({ ...previous, fileError: invalidKeyFileMessage }));
        }
      } finally {
        if (selectedRead.current === readOwner) {
          selectedRead.current = null;
        }
      }
    },
    [isCurrent, changeInput, readFile, invalidKeyFileMessage],
  );

  const submit = useCallback(async (): Promise<boolean> => {
    const staged = currentInput.current;
    if (!isCurrent() || pendingSubmit.current) {
      return false;
    }
    if (!staged?.serviceAccountJson || !isEmail(staged.subjectEmail.trim())) {
      return configured.current;
    }
    const submitOwner = {};
    pendingSubmit.current = submitOwner;
    try {
      await setCredentials({ serviceAccountJson: staged.serviceAccountJson, subjectEmail: staged.subjectEmail.trim() });
      if (isCurrent() && pendingSubmit.current === submitOwner && currentInput.current?.revision === staged.revision) {
        changeInput(previous => ({
          ...previous,
          revision: previous.revision + 1,
          serviceAccountJson: '',
          fileName: null,
        }));
        return true;
      }
    } catch (error) {
      if (isCurrent() && pendingSubmit.current === submitOwner && currentInput.current?.revision === staged.revision) {
        throw error;
      }
    } finally {
      if (pendingSubmit.current === submitOwner) {
        pendingSubmit.current = null;
      }
    }
    return false;
  }, [isCurrent, setCredentials, changeInput]);

  return {
    fileName: input.fileName,
    subjectEmail: input.subjectEmail,
    fileError: input.fileError,
    isConfigured,
    canContinue: isCurrent() && (isConfigured || hasPendingCredential),
    setSubjectEmail: value =>
      changeInput(previous => ({ ...previous, revision: previous.revision + 1, subjectEmail: value })),
    selectFile,
    submit,
  };
};
