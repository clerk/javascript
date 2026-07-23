import type { FieldId } from '@clerk/shared/types';
import React, { type JSX } from 'react';

import { type LocalizationKey, Text } from '@/customizables';
import { Form } from '@/elements/Form';
import type { FormControlState } from '@/ui/utils/useFormControl';

import { ActiveConnectionAlert } from '../../saml/shared/ActiveConnectionAlert';

type FormControl = FormControlState<FieldId>;

type DiscoveryUrlForm = {
  discoveryUrlField: FormControl;
};

type DiscoveryUrlLabels = {
  description: LocalizationKey;
};

type ManualEndpointsForm = {
  authUrlField: FormControl;
  tokenUrlField: FormControl;
  userInfoUrlField: FormControl;
};

type ManualEndpointsLabels = {
  description: LocalizationKey;
};

export type OidcEndpointsConfigurationFormProps =
  | { mode: 'discoveryUrl'; form: DiscoveryUrlForm; labels: DiscoveryUrlLabels }
  | { mode: 'manual'; form: ManualEndpointsForm; labels: ManualEndpointsLabels };

export const OidcEndpointsConfigurationForm = (props: OidcEndpointsConfigurationFormProps): JSX.Element => {
  switch (props.mode) {
    case 'discoveryUrl':
      return (
        <>
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={props.labels.description}
          />
          <Form.ControlRow elementId={props.form.discoveryUrlField.id}>
            <Form.PlainInput {...props.form.discoveryUrlField.props} />
          </Form.ControlRow>
          <ActiveConnectionAlert />
        </>
      );
    case 'manual':
      return (
        <>
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={props.labels.description}
          />
          <Form.ControlRow elementId={props.form.authUrlField.id}>
            <Form.PlainInput {...props.form.authUrlField.props} />
          </Form.ControlRow>
          <Form.ControlRow elementId={props.form.tokenUrlField.id}>
            <Form.PlainInput {...props.form.tokenUrlField.props} />
          </Form.ControlRow>
          <Form.ControlRow elementId={props.form.userInfoUrlField.id}>
            <Form.PlainInput {...props.form.userInfoUrlField.props} />
          </Form.ControlRow>
          <ActiveConnectionAlert />
        </>
      );
    default: {
      const unhandledMode: never = props;
      throw new Error(`Unhandled OIDC endpoints configuration mode: ${(unhandledMode as { mode: string }).mode}`);
    }
  }
};
