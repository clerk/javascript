import { Box, Button, Col, descriptors, Flex, localizationKeys } from '@/customizables';
import { Field } from '@/elements/FieldControl';
import { Form } from '@/elements/Form';

import type { useDomainsFieldController } from './domains-field.controller';

export const DomainsFieldView = ({
  domainField,
  canSubmit,
  isSubmitting,
  handleSubmit,
}: ReturnType<typeof useDomainsFieldController>): JSX.Element => {
  return (
    <Form.Root onSubmit={handleSubmit}>
      <Field.Root {...domainField.props}>
        <Col
          elementDescriptor={descriptors.formField}
          elementId={descriptors.formField.setId(domainField.id)}
          sx={t => ({ gap: t.space.$2 })}
        >
          <Field.LabelRow>
            <Field.Label />
          </Field.LabelRow>

          <Flex
            align='start'
            sx={t => ({ gap: t.space.$2 })}
          >
            <Box sx={{ flex: 1 }}>
              <Field.Input />
            </Box>

            <Button
              type='submit'
              variant='bordered'
              colorScheme='secondary'
              isDisabled={!canSubmit}
              isLoading={isSubmitting}
              localizationKey={localizationKeys('configureSSO.organizationDomainsStep.formButtonPrimary__add')}
              sx={{ flexShrink: 0 }}
            />
          </Flex>
        </Col>
      </Field.Root>
    </Form.Root>
  );
};
