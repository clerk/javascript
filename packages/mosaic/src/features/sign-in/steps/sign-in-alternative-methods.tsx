import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { ProviderButton, ProviderButtonGroup } from '../../../components/provider-button';
import { Text } from '../../../components/text';
import type { IconComponent } from '../../../icons/glyph';
import { fill, useMessages } from '../../../localization';
import { styles } from '../sign-in.styles';
import type { SignInProvider } from '../sign-in.types';

interface SignInMethodOption {
  id: string;
  label: string;
  icon: IconComponent;
}

interface SignInAlternativeMethodsProps {
  title: string;
  description: string;
  methods: readonly SignInMethodOption[];
  pendingMethodId?: string;
  onSelectMethod: (id: string) => void;
  socialProviders: readonly SignInProvider[];
  pendingProviderId?: string;
  onSelectProvider: (id: string) => void;
  isDisabled: boolean;
  globalErrorMessage?: string;
  onBack: () => void;
  onShowHelp: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInAlternativeMethods({
  title,
  description,
  methods,
  pendingMethodId,
  onSelectMethod,
  socialProviders,
  pendingProviderId,
  onSelectProvider,
  isDisabled,
  globalErrorMessage,
  onBack,
  onShowHelp,
  focusRef,
}: SignInAlternativeMethodsProps) {
  const m = useMessages('signIn');
  const firstMethodRef = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);

  return (
    <>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        <div {...stylex.props(styles.buttonStack)}>
          {socialProviders.length > 0 ? (
            <ProviderButtonGroup disabled={isDisabled}>
              {socialProviders.map(provider => (
                <ProviderButton
                  key={provider.id}
                  icon={
                    <img
                      src={provider.iconUrl}
                      alt=''
                      {...stylex.props(styles.providerIcon)}
                    />
                  }
                  longLabel={fill(m.start.socialButton, { provider: provider.name })}
                  shortLabel={provider.name}
                  isPending={pendingProviderId === provider.id}
                  pendingLabel={m.verifying}
                  onClick={() => onSelectProvider(provider.id)}
                />
              ))}
            </ProviderButtonGroup>
          ) : null}
          <ProviderButtonGroup
            layout='stacked'
            disabled={isDisabled}
          >
            {methods.map((method, index) => (
              <ProviderButton
                key={method.id}
                ref={index === 0 ? firstMethodRef : undefined}
                icon={<Icon glyph={method.icon} />}
                longLabel={method.label}
                shortLabel={method.label}
                isPending={pendingMethodId === method.id}
                pendingLabel={m.verifying}
                onClick={() => onSelectMethod(method.id)}
              />
            ))}
          </ProviderButtonGroup>
        </div>
        <Text
          size='sm'
          xstyle={styles.footerText}
        >
          <Button
            type='button'
            size='sm'
            variant='link'
            color='neutral'
            disabled={isDisabled}
            onClick={onBack}
          >
            {m.back}
          </Button>
        </Text>
        <Text
          size='xs'
          color='foreground-secondary'
          xstyle={styles.footerText}
        >
          {m.alternativeMethods.helpPrompt}{' '}
          <Button
            type='button'
            size='sm'
            variant='link'
            color='neutral'
            disabled={isDisabled}
            onClick={onShowHelp}
          >
            {m.alternativeMethods.helpLink}
          </Button>
        </Text>
      </Card.Content>
    </>
  );
}
