import type React from 'react';
import { useEffect, useRef } from 'react';

import { useCardState } from '@/elements/contexts';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { localizationKeys } from '../../../customizables';
import type { SettingId, useSettingsSectionModel } from './settings-section.model';

export const useSettingsFormController = (model: ReturnType<typeof useSettingsSectionModel>) => {
  const card = useCardState();
  const useSettingField = (id: SettingId) =>
    useFormControl(id, '', {
      type: 'checkbox',
      label: localizationKeys(`organizationProfile.securityPage.connectionPage.settings.${id}.label`),
      defaultChecked: model.initial[id],
    });

  const fields = {
    syncUserAttributes: useSettingField('syncUserAttributes'),
    allowAdditionalIdentifiers: useSettingField('allowAdditionalIdentifiers'),
    allowSubdomains: useSettingField('allowSubdomains'),
    allowIdpInitiated: useSettingField('allowIdpInitiated'),
    forceAuthn: useSettingField('forceAuthn'),
  };

  const changed = model.applicable.filter(id => Boolean(fields[id].checked) !== model.initial[id]);

  const latest = useRef({ card, model, fields, changed });
  latest.current = { card, model, fields, changed };
  const mounted = useRef(true);
  const pending = useRef<Promise<void>>();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current = undefined;
    };
  }, []);

  const onReset = () => {
    if (!mounted.current || pending.current || latest.current.card.isLoading) {
      return;
    }
    const { card, model, fields } = latest.current;
    card.setError(undefined);
    model.applicable.forEach(id => fields[id].setChecked(model.initial[id]));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mounted.current || latest.current.changed.length === 0) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current;
    }
    const { card, changed, fields } = latest.current;
    const values = changed.map(id => ({ id, checked: Boolean(fields[id].checked) }));
    card.setError(undefined);
    const ownsRequest = () => mounted.current && pending.current === action;
    const action = Promise.resolve()
      .then(() => {
        if (ownsRequest()) {
          return latest.current.model.update(values);
        }
        return;
      })
      .catch(error => {
        if (ownsRequest()) {
          handleError(error, [], latest.current.card.setError);
        }
      })
      .finally(() => {
        if (pending.current === action) {
          pending.current = undefined;
        }
      });
    pending.current = action;
    return action;
  };

  return {
    fields,
    applicable: model.applicable,
    error: card.error,
    isDisabled: changed.length === 0 || card.isLoading,
    onReset,
    onSubmit,
  };
};
