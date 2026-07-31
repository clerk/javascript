import React, { type PropsWithChildren } from 'react';

import { Col, Flex, SimpleButton, Text } from '@/customizables';

/**
 * PROTOTYPE ONLY — throwaway discussion scaffolding for the self-serve
 * Directory Sync onboarding flow. All state is local and fake; nothing here
 * talks to an API. Do not ship.
 */

export type PrototypeIdpProvider = 'okta' | 'entra' | 'google' | 'custom';
export type PrototypeSetupStatus = 'complete' | 'incomplete';
export type PrototypeSyncLogState = 'empty' | 'streaming' | 'failure';
export type PrototypeDeprovisionBehavior = 'suspend' | 'delete';

export interface PrototypeProviderMeta {
  name: string;
  /** Whether the IdP has native outbound SCIM provisioning. */
  supportsScim: boolean;
  /** Where the admin pastes the endpoint + token, as numbered instructions. */
  instructions: string[];
}

export const PROTOTYPE_PROVIDERS: Record<PrototypeIdpProvider, PrototypeProviderMeta> = {
  okta: {
    name: 'Okta Workforce',
    supportsScim: true,
    instructions: [
      'In the Okta Admin Console, open the application used for your SSO connection.',
      'Open the Provisioning tab and select Configure API Integration.',
      'Check Enable API integration, then paste the SCIM endpoint URL and bearer token below.',
      'Under Provisioning to App, enable Create Users, Update User Attributes, and Deactivate Users.',
    ],
  },
  entra: {
    name: 'Microsoft Entra ID',
    supportsScim: true,
    instructions: [
      'In the Microsoft Entra admin center, open Enterprise applications and select the application used for your SSO connection.',
      'Select Provisioning and set the provisioning mode to Automatic.',
      'Paste the SCIM endpoint URL as the Tenant URL and the bearer token as the Secret Token, then select Test Connection.',
      'Assign the users and groups to provision, then turn provisioning On.',
    ],
  },
  google: {
    name: 'Google Workspace',
    supportsScim: false,
    instructions: [],
  },
  custom: {
    name: 'Custom SCIM provider',
    supportsScim: true,
    instructions: [
      'Create a SCIM 2.0 provisioning integration in your identity provider.',
      'Paste the SCIM endpoint URL as the base URL for the integration.',
      'Configure the integration to authenticate with the bearer token below.',
      'Enable provisioning for user create, update, and deactivate events.',
    ],
  },
};

export interface PrototypeState {
  provider: PrototypeIdpProvider;
  setProvider: (p: PrototypeIdpProvider) => void;
  setupStatus: PrototypeSetupStatus;
  setSetupStatus: (s: PrototypeSetupStatus) => void;
  syncLog: PrototypeSyncLogState;
  setSyncLog: (s: PrototypeSyncLogState) => void;
  deprovisionBehavior: PrototypeDeprovisionBehavior;
  setDeprovisionBehavior: (b: PrototypeDeprovisionBehavior) => void;
  isDirectorySyncActive: boolean;
  setIsDirectorySyncActive: (a: boolean) => void;
  tokenGeneration: number;
  regenerateToken: () => void;
  providerMeta: PrototypeProviderMeta;
  /** An identity provider has been selected (the selection flow ran) — the wizard's entry precondition. */
  isSetupComplete: boolean;
}

// Module-level mirror of the activation state so the Security overview can
// read it after the wizard unmounts (the wizard's React state resets on exit).
let directorySyncActivated = false;
export const isDirectorySyncActivated = (): boolean => directorySyncActivated;

const PrototypeContext = React.createContext<PrototypeState | null>(null);
PrototypeContext.displayName = 'DirectorySyncPrototypeContext';

export const PrototypeStateProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [provider, setProvider] = React.useState<PrototypeIdpProvider>('okta');
  const [setupStatus, setSetupStatus] = React.useState<PrototypeSetupStatus>('complete');
  const [syncLog, setSyncLog] = React.useState<PrototypeSyncLogState>('empty');
  const [deprovisionBehavior, setDeprovisionBehavior] = React.useState<PrototypeDeprovisionBehavior>('suspend');
  const [isDirectorySyncActive, setIsDirectorySyncActiveState] = React.useState(directorySyncActivated);
  const [tokenGeneration, setTokenGeneration] = React.useState(1);

  const setIsDirectorySyncActive = React.useCallback((active: boolean) => {
    directorySyncActivated = active;
    setIsDirectorySyncActiveState(active);
  }, []);

  const value = React.useMemo<PrototypeState>(
    () => ({
      provider,
      setProvider,
      setupStatus,
      setSetupStatus,
      syncLog,
      setSyncLog,
      deprovisionBehavior,
      setDeprovisionBehavior,
      isDirectorySyncActive,
      setIsDirectorySyncActive,
      tokenGeneration,
      regenerateToken: () => setTokenGeneration(g => g + 1),
      providerMeta: PROTOTYPE_PROVIDERS[provider],
      isSetupComplete: setupStatus === 'complete',
    }),
    [
      provider,
      setupStatus,
      syncLog,
      deprovisionBehavior,
      isDirectorySyncActive,
      setIsDirectorySyncActive,
      tokenGeneration,
    ],
  );

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
};

export const usePrototype = (): PrototypeState => {
  const ctx = React.useContext(PrototypeContext);
  if (!ctx) {
    throw new Error('usePrototype called outside <PrototypeStateProvider>.');
  }
  return ctx;
};

const PanelRow = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ id: T; label: string }>;
  onChange: (v: T) => void;
}): JSX.Element => (
  <Col sx={t => ({ gap: t.space.$1 })}>
    <Text
      as='span'
      colorScheme='secondary'
      sx={t => ({ fontSize: t.fontSizes.$xs, fontWeight: t.fontWeights.$medium })}
    >
      {label}
    </Text>
    <Flex
      wrap='wrap'
      sx={t => ({ gap: t.space.$1 })}
    >
      {options.map(option => (
        <SimpleButton
          key={option.id}
          variant='unstyled'
          onClick={() => onChange(option.id)}
          sx={t => ({
            fontSize: t.fontSizes.$xs,
            padding: `${t.space.$0x5} ${t.space.$2}`,
            borderRadius: t.radii.$sm,
            borderWidth: t.borderWidths.$normal,
            borderStyle: t.borderStyles.$solid,
            borderColor: option.id === value ? t.colors.$primary500 : t.colors.$borderAlpha150,
            backgroundColor: option.id === value ? t.colors.$primary500 : 'transparent',
            color: option.id === value ? t.colors.$colorPrimaryForeground : t.colors.$colorMutedForeground,
          })}
        >
          {option.label}
        </SimpleButton>
      ))}
    </Flex>
  </Col>
);

/**
 * Floating dev panel for driving the prototype's fake states during a design
 * discussion. Deliberately styled as scaffolding (dashed border), not design.
 */
export const PrototypeControlsPanel = (): JSX.Element => {
  const p = usePrototype();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <Col
      sx={t => ({
        position: 'fixed',
        bottom: t.space.$4,
        insetInlineEnd: t.space.$4,
        zIndex: 999999,
        width: '15rem',
        gap: t.space.$3,
        padding: t.space.$3,
        borderRadius: t.radii.$md,
        borderWidth: t.borderWidths.$normal,
        borderStyle: 'dashed',
        borderColor: t.colors.$warning500,
        backgroundColor: t.colors.$colorBackground,
        boxShadow: t.shadows.$cardBoxShadow,
      })}
    >
      <Flex
        align='center'
        justify='between'
      >
        <Text
          as='span'
          sx={t => ({ fontSize: t.fontSizes.$xs, fontWeight: t.fontWeights.$semibold, color: t.colors.$warning500 })}
        >
          Prototype controls
        </Text>
        <SimpleButton
          variant='unstyled'
          onClick={() => setIsCollapsed(c => !c)}
          sx={t => ({ fontSize: t.fontSizes.$xs, padding: 0, color: t.colors.$colorMutedForeground })}
        >
          {isCollapsed ? 'Show' : 'Hide'}
        </SimpleButton>
      </Flex>

      {!isCollapsed && (
        <>
          <PanelRow
            label='Identity provider'
            value={p.provider}
            onChange={p.setProvider}
            options={[
              { id: 'okta', label: 'Okta' },
              { id: 'entra', label: 'Entra' },
              { id: 'google', label: 'Google' },
              { id: 'custom', label: 'Custom' },
            ]}
          />
          <PanelRow
            label='IdP selection'
            value={p.setupStatus}
            onChange={p.setSetupStatus}
            options={[
              { id: 'complete', label: 'Selected' },
              { id: 'incomplete', label: 'Not selected' },
            ]}
          />
          <PanelRow
            label='Sync log'
            value={p.syncLog}
            onChange={p.setSyncLog}
            options={[
              { id: 'empty', label: 'Empty' },
              { id: 'streaming', label: 'Events' },
              { id: 'failure', label: 'Failure' },
            ]}
          />
          <PanelRow
            label='Directory Sync'
            value={p.isDirectorySyncActive ? 'active' : 'inactive'}
            onChange={v => p.setIsDirectorySyncActive(v === 'active')}
            options={[
              { id: 'inactive', label: 'Inactive' },
              { id: 'active', label: 'Active' },
            ]}
          />
        </>
      )}
    </Col>
  );
};
