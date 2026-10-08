import type { FormEventHandler } from 'react';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { localizationKeys } from '@/ui/customizables';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { useOAuthDeviceVerificationModel } from './oauth-device-verification.model';
import { isValidOAuthDeviceUserCode, normalizeOAuthDeviceUserCode } from './utils';

export type DeviceView =
  | 'entry'
  | 'loading'
  | 'confirmation'
  | 'approved'
  | 'alreadyApproved'
  | 'denied'
  | 'alreadyDenied'
  | 'consumed'
  | 'expired'
  | 'rateLimited'
  | 'alreadyDecided'
  | 'error';

type Decision = 'approve' | 'deny';
type DeviceState = { view: DeviceView; submittingDecision: Decision | null };
type DeviceEvent =
  | { type: 'lookupStarted' }
  | { type: 'lookupResult'; status: string }
  | { type: 'lookupError'; code: string | undefined }
  | { type: 'decisionStarted'; decision: Decision }
  | { type: 'decisionResult'; decision: Decision }
  | { type: 'decisionError'; code: string | undefined }
  | { type: 'reset' };

const decisionErrorView = (code: string | undefined): DeviceView => {
  switch (code) {
    case 'oauth_device_code_expired':
      return 'expired';
    case 'too_many_requests':
      return 'rateLimited';
    case 'bad_request':
      return 'alreadyDecided';
    default:
      return 'error';
  }
};

const deviceReducer = (state: DeviceState, event: DeviceEvent): DeviceState => {
  switch (event.type) {
    case 'lookupStarted':
      return { ...state, view: 'loading' };
    case 'lookupResult':
      switch (event.status) {
        case 'pending':
          return { ...state, view: 'confirmation' };
        case 'approved':
          return { ...state, view: 'alreadyApproved' };
        case 'denied':
          return { ...state, view: 'alreadyDenied' };
        case 'consumed':
          return { ...state, view: 'consumed' };
        default:
          return { ...state, view: 'error' };
      }
    case 'lookupError':
      return {
        ...state,
        view:
          event.code === 'resource_not_found'
            ? 'entry'
            : event.code === 'oauth_device_code_expired'
              ? 'expired'
              : event.code === 'too_many_requests'
                ? 'rateLimited'
                : 'error',
      };
    case 'decisionStarted':
      return { ...state, submittingDecision: event.decision };
    case 'decisionResult':
      return { view: event.decision === 'approve' ? 'approved' : 'denied', submittingDecision: null };
    case 'decisionError':
      return { view: decisionErrorView(event.code), submittingDecision: null };
    case 'reset':
      return { view: 'entry', submittingDecision: null };
    default:
      return state;
  }
};

export const useOAuthDeviceVerificationController = (model: ReturnType<typeof useOAuthDeviceVerificationModel>) => {
  const [state, dispatch] = useReducer(deviceReducer, { view: 'entry', submittingDecision: null });
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const handledPrefill = useRef(false);
  const decisionInProgress = useRef(false);
  const codeControl = useFormControl('userCode', '', {
    type: 'text',
    label: localizationKeys('oauthDeviceVerification.start.userCodeLabel'),
    transformer: normalizeOAuthDeviceUserCode,
    isRequired: true,
  });

  const lookup = useCallback(
    async (userCode: string) => {
      codeControl.clearFeedback();
      dispatch({ type: 'lookupStarted' });
      const result = await model.lookup(userCode);
      if (result.ok) {
        dispatch({ type: 'lookupResult', status: result.status });
      } else {
        dispatch({ type: 'lookupError', code: result.code });
        if (result.code === 'resource_not_found') {
          codeControl.setError(model.unknownCodeMessage);
        }
      }
    },
    [codeControl, model],
  );

  useEffect(() => {
    if (handledPrefill.current) {
      return;
    }
    handledPrefill.current = true;
    if (!model.prefillCode) {
      return;
    }
    codeControl.setValue(normalizeOAuthDeviceUserCode(model.prefillCode));
    if (!isValidOAuthDeviceUserCode(model.prefillCode)) {
      codeControl.setError(model.invalidCodeMessage);
      return;
    }
    void lookup(normalizeOAuthDeviceUserCode(model.prefillCode));
  }, [codeControl, lookup, model.prefillCode, model.invalidCodeMessage]);

  const onLookup: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    const userCode = normalizeOAuthDeviceUserCode(codeControl.value);
    if (!isValidOAuthDeviceUserCode(userCode)) {
      codeControl.setError(model.invalidCodeMessage);
      return;
    }
    void lookup(userCode);
  };

  const effectiveOrg = selectedOrg ?? model.defaultOrg;
  const decide = async (decision: Decision) => {
    if (decisionInProgress.current) {
      return;
    }
    decisionInProgress.current = true;
    dispatch({ type: 'decisionStarted', decision });
    const userCode = normalizeOAuthDeviceUserCode(codeControl.value);
    try {
      const result = decision === 'approve' ? await model.approve(userCode, effectiveOrg) : await model.deny(userCode);
      if (result.ok) {
        dispatch({ type: 'decisionResult', decision });
      } else {
        dispatch({ type: 'decisionError', code: result.code });
      }
    } finally {
      decisionInProgress.current = false;
    }
  };

  return {
    view: state.view,
    codeControl,
    data: model.data,
    primaryIdentifier: model.primaryIdentifier,
    showClerkLogo: model.showClerkLogo,
    orgOptions: model.orgOptions,
    orgSelectionEnabled: model.orgSelectionEnabled,
    effectiveOrg,
    isSubmitting: model.isSubmitting,
    submittingDecision: state.submittingDecision,
    onLookup,
    onApprove: () => decide('approve'),
    onDeny: () => decide('deny'),
    onSelectOrg: setSelectedOrg,
    onReset: () => {
      decisionInProgress.current = false;
      model.reset();
      codeControl.setValue('');
      codeControl.clearFeedback();
      setSelectedOrg(null);
      dispatch({ type: 'reset' });
    },
  };
};
