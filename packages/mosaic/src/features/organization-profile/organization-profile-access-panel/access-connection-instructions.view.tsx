import * as stylex from '@stylexjs/stylex';

import { Badge } from '../../../components/badge';
import { CopyButton } from '../../../components/copy-button';
import { Field } from '../../../components/field';
import { Icon } from '../../../components/icon';
import { InputGroup } from '../../../components/input-group';
import { Section } from '../../../components/section';
import { Switch } from '../../../components/switch';
import { Table } from '../../../components/table';
import { InformationCircle } from '../../../icons/glyphs/information-circle';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { mergeStyleProps, themeProps } from '../../../props';
import { styles } from './access.styles';
import { connectionAttributes } from './access.utils';
import type { AccessConnectionStepProps } from './access-connection.controller';
import { SsoConnectValues, SsoMetadataFields } from './access-connection-fields.view';
import { AccessSelect, StepTitle } from './access-fields.view';

export function AttributesStep({ controller }: AccessConnectionStepProps) {
  const m = useMessages('organizationProfile').access;
  const attributes = connectionAttributes(controller.kind, controller.form.values.provider);
  return (
    <>
      <StepTitle
        description={
          controller.kind === 'directory'
            ? m.directoryAttributes
            : controller.form.values.provider === 'okta'
              ? m.oktaAttributeDescription
              : m.attributeDescription
        }
      >
        {controller.kind === 'sso' ? m.attributeStatements : m.attributes}
      </StepTitle>
      <div {...stylex.props(styles.stepContent)}>
        <Table.Root aria-label={m.attributes}>
          <Table.Header>
            <Table.Column>{controller.kind === 'sso' ? m.attributeName : m.fromProvider}</Table.Column>
            <Table.Column>{controller.kind === 'sso' ? m.attributeRole : m.mapsTo}</Table.Column>
          </Table.Header>
          <Table.Body
            items={attributes}
            itemToStringValue={item => item.name}
          >
            {item => (
              <Table.Row key={item.name}>
                <Table.Cell>
                  {item.name}{' '}
                  {controller.kind === 'sso' ? (
                    <Badge color={item.field === 'email' ? 'warning' : 'neutral'}>
                      {item.field === 'email' ? m.required : m.optional}
                    </Badge>
                  ) : null}
                </Table.Cell>
                <Table.Cell>
                  {controller.kind === 'sso' && controller.form.values.provider === 'okta' ? (
                    <InputGroup.Root>
                      <InputGroup.Input
                        aria-label={item.name}
                        readOnly
                        value={item.expression}
                      />
                      <InputGroup.End>
                        <CopyButton
                          value={item.expression}
                          label={m.copy}
                          copiedLabel={m.copied}
                        />
                      </InputGroup.End>
                    </InputGroup.Root>
                  ) : (
                    m[item.field]
                  )}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>
    </>
  );
}

export function AssignmentStep({ controller }: AccessConnectionStepProps) {
  const m = useMessages('organizationProfile').access;
  const okta = controller.form.values.provider === 'okta';
  return (
    <>
      <StepTitle description={okta ? m.oktaAssignmentDescription : m.assignmentDescription}>{m.assignment}</StepTitle>
      <div {...stylex.props(styles.stepContent)}>
        <ol {...stylex.props(styles.instructionsList)}>
          <li>{okta ? m.oktaAssignStepOne : m.assignStepOne}</li>
          <li>{okta ? m.oktaAssignStepTwo : m.assignStepTwo}</li>
        </ol>
        <div {...stylex.props(styles.row)}>
          <Icon glyph={InformationCircle} />
          <Section.Description xstyle={styles.stepDescription}>
            {okta ? m.oktaAssignmentTip : m.assignmentTip}
          </Section.Description>
        </div>
      </div>
    </>
  );
}

export function MetadataStep({ controller, data }: AccessConnectionStepProps) {
  return (
    <Form
      id={controller.form.id}
      onSubmit={controller.form.handleSubmit}
      {...mergeStyleProps(themeProps('access-connection-form'), stylex.props(styles.stepContent))}
    >
      {data.live && controller.configured ? (
        <SsoConnectValues
          oidc={controller.form.values.provider === 'oidc'}
          serviceProvider={controller.configured}
        />
      ) : null}
      <SsoMetadataFields
        controller={controller}
        showInstructions
      />
    </Form>
  );
}

export function RolesStep({ controller, data }: AccessConnectionStepProps) {
  const m = useMessages('organizationProfile').access;
  const roles = [
    { value: 'member', label: m.member },
    { value: 'admin', label: m.admin },
    { value: 'none', label: m.none },
  ];
  return (
    <>
      <StepTitle>{m.roles}</StepTitle>
      <div {...stylex.props(styles.stepContent)}>
        <Section.Description>{m.roleDescription}</Section.Description>
        {!data.live ? (
          <AccessSelect
            label={m.defaultRole}
            value={controller.form.values.defaultRole}
            items={roles}
            onChange={value => controller.form.setValue('defaultRole', value)}
            disabled={controller.pending}
          />
        ) : null}
        <Field.Root
          orientation='horizontal'
          disabled={controller.pending}
        >
          <Switch
            checked={controller.form.values.syncGroups}
            onChange={event => controller.form.setValue('syncGroups', event.target.checked)}
          />
          <Field.Label>{m.syncGroups}</Field.Label>
        </Field.Root>
        {controller.form.values.syncGroups
          ? controller.result?.groups?.map(group => (
              <AccessSelect
                key={group}
                label={controller.result?.groupNames?.[group] ?? group}
                value={
                  controller.form.values.groupRoles[group] ??
                  controller.result?.groupRoles?.[group] ??
                  (data.live ? 'none' : 'member')
                }
                items={roles}
                onChange={value =>
                  controller.form.setValue('groupRoles', { ...controller.form.values.groupRoles, [group]: value })
                }
                disabled={controller.pending}
              />
            ))
          : null}
      </div>
    </>
  );
}
