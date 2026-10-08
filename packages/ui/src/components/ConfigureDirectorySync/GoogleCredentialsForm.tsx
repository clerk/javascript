import { useRef } from 'react';

import { useGoogleCredentialsController } from './google-credentials.controller';
import { useGoogleCredentialsFormModel, useGoogleCredentialsModel } from './google-credentials.model';
import { GoogleCredentialsFormView } from './google-credentials.view';

export type GoogleCredentialsState = {
  fileName: string | null;
  subjectEmail: string;
  fileError: string | null;
  isConfigured: boolean;
  /** Whether the step can be left: a credential is stored, or one is ready to send. */
  canContinue: boolean;
  setSubjectEmail: (value: string) => void;
  selectFile: (file: File | undefined) => Promise<void>;
  /** Sends the pending credential, if there is one. Rejects if the provider refuses it. */
  submit: () => Promise<boolean>;
};

/**
 * Holds the credential a pull-based directory reads the identity provider with.
 *
 * State lives here rather than inside the form so the step footer can drive it:
 * the wizard's Continue performs the submit, so the form has no button of its
 * own and there is only one way forward.
 */
export const useGoogleCredentialsState = (): GoogleCredentialsState => {
  const model = useGoogleCredentialsModel();
  return useGoogleCredentialsController(model);
};

/**
 * Collects the service account key and the administrator it impersonates. The
 * key is never held in wizard state, which outlives the request.
 */
export const GoogleCredentialsForm = ({ state }: { state: GoogleCredentialsState }): JSX.Element => {
  const model = useGoogleCredentialsFormModel();
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <GoogleCredentialsFormView
      state={state}
      {...model}
      fileInputRef={fileInputRef}
    />
  );
};
