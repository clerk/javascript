import type { FieldId } from '@clerk/shared/types';
import { type JSX } from 'react';

import { type LocalizationKey, Text } from '@/customizables';
import { Form } from '@/elements/Form';
import type { FormControlState } from '@/ui/utils/useFormControl';

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
  if (props.mode === 'discoveryUrl') {
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
      </>
    );
  }

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
    </>
  );
};
