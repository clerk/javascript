import { iconImageUrl } from '@clerk/shared/constants';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import { CopyButton } from '../../../components/copy-button';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { InputGroup } from '../../../components/input-group';
import { Radio } from '../../../components/radio';
import { Section } from '../../../components/section';
import { Select } from '../../../components/select';
import { Key } from '../../../icons/glyphs/key';
import { useMessages } from '../../../localization';
import { styles } from './access.styles';
import type { AccessProvider } from './access.types';

export function AccessSelect({
  label,
  hideLabel,
  placeholder,
  value,
  items,
  onChange,
  disabled,
  provider,
}: {
  label: string;
  hideLabel?: boolean;
  placeholder?: string;
  value: string | null;
  items: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  provider?: AccessProvider;
}) {
  return (
    <Field.Root
      disabled={disabled}
      xstyle={styles.control}
    >
      <Field.Label visuallyHidden={hideLabel}>{label}</Field.Label>
      <Select.Root
        value={value}
        items={items}
        onValueChange={value => {
          if (value !== null) {
            onChange(value);
          }
        }}
      >
        <Select.Trigger placeholder={placeholder}>
          {provider ? (
            <span {...stylex.props(styles.row, styles.grow)}>
              <AccessProviderIcon provider={provider} />
              {items.find(item => item.value === value)?.label}
            </span>
          ) : undefined}
        </Select.Trigger>
        <Select.Popup />
      </Select.Root>
    </Field.Root>
  );
}

export function AccessCopyField({
  label,
  value,
  hideLabel = false,
}: {
  label: string;
  value: string;
  hideLabel?: boolean;
}) {
  const m = useMessages('organizationProfile').access;
  return (
    <Field.Root>
      <Field.Label visuallyHidden={hideLabel}>{label}</Field.Label>
      <InputGroup.Root>
        <InputGroup.Input
          readOnly
          value={value}
        />
        <InputGroup.End>
          <CopyButton
            value={value}
            label={m.copy}
            copiedLabel={m.copied}
          />
        </InputGroup.End>
      </InputGroup.Root>
    </Field.Root>
  );
}

export function AccessRadio({ value, label, description }: { value: string; label: string; description: ReactNode }) {
  return (
    <Field.Root orientation='horizontal'>
      <Radio.Item value={value} />
      <Field.Content>
        <Field.Label>{label}</Field.Label>
        <Field.Description>{description}</Field.Description>
      </Field.Content>
    </Field.Root>
  );
}

export function AccessProviderIcon({ provider }: { provider: AccessProvider }) {
  if (provider === 'oidc') {
    return <Icon glyph={Key} />;
  }
  return (
    <img
      src={iconImageUrl(provider === 'entra' ? 'microsoft' : provider)}
      alt=''
      {...stylex.props(styles.providerIcon)}
    />
  );
}

export function StepTitle({ children, description }: { children: string; description?: string }) {
  const focus = useFlowAutoFocus<HTMLHeadingElement>();
  return (
    <div {...stylex.props(styles.stepHeading)}>
      <Section.Title
        ref={focus}
        tabIndex={-1}
      >
        {children}
      </Section.Title>
      {description ? <Section.Description xstyle={styles.stepDescription}>{description}</Section.Description> : null}
    </div>
  );
}
