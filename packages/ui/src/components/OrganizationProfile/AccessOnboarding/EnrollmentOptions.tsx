import type { FieldId } from '@clerk/shared/types';

import { Form } from '@/ui/elements/Form';
import type { useFormControl } from '@/ui/utils/useFormControl';

import { Col, Text } from '../../../customizables';
import type { ProtoDomain } from './prototypeState';
import { enrollmentChoicesFor, recommendedEnrollmentFor } from './prototypeState';

type EnrollmentOptionsProps = {
  domain: ProtoDomain;
  signInMode: 'default' | 'sso';
  field: ReturnType<typeof useFormControl<FieldId>>;
};

/*
 * The house radio group (same pattern as VerifiedDomainForm), fed the
 * modes the domain's proof level has unlocked. Locked modes list beneath
 * with their reasons; the recommended mode is marked in its label.
 */
export const EnrollmentOptions = ({ domain, signInMode, field }: EnrollmentOptionsProps) => {
  const { options, locked } = enrollmentChoicesFor(domain, signInMode);
  const recommended = recommendedEnrollmentFor(signInMode);

  return (
    <Col sx={t => ({ gap: t.space.$2 })}>
      <Form.RadioGroup
        {...field.props}
        radioOptions={options.map(option => ({
          ...option,
          label: option.value === recommended ? `${option.label} (recommended)` : option.label,
        }))}
      />
      {locked.length > 0 ? (
        <Col sx={t => ({ gap: t.space.$0x5 })}>
          {locked.map(entry => (
            <Text
              key={entry.label}
              colorScheme='secondary'
              sx={t => ({ fontSize: t.fontSizes.$sm })}
            >
              {`${entry.label}: ${entry.reason}.`}
            </Text>
          ))}
        </Col>
      ) : null}
    </Col>
  );
};
