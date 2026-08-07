import { useEffect, useRef } from 'react';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Text } from '../components/text';
import type { OrganizationProfileSecurityWizardActivateStep } from './organization-profile-security-panel.controller';

/**
 * The `activate` step body, ported from the legacy `steps/ActivateStep.tsx` — the terminal step. It
 * owns its own actions: Activate sends `ACTIVATE` (the machine activates + fires telemetry via the
 * controller, then the controller exits the wizard), Skip / Done exit the wizard directly.
 *
 * The `active` vs not-active copy is derived from the live `isActive` input. Copy matches the legacy
 * `configureSSO.activate.*` values. The decorative shield icon is deferred to the view overhaul.
 */

export interface OrganizationProfileSecurityWizardActivateViewProps {
  activate: OrganizationProfileSecurityWizardActivateStep;
}

export function OrganizationProfileSecurityWizardActivateView({
  activate,
}: OrganizationProfileSecurityWizardActivateViewProps) {
  const { snapshot, send, isActive, domain, onExit } = activate;

  // Reset the flow to idle on (re-)entry, matching the legacy step remounting fresh.
  const entered = useRef(false);
  useEffect(() => {
    if (!entered.current) {
      entered.current = true;
      send({ type: 'ENTER' });
    }
  }, [send]);

  // `activating` and `activated` (exit deferred to the controller) both keep the button loading.
  const isBusy = snapshot.value === 'activating' || snapshot.value === 'activated';

  return (
    <Box
      sx={t => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: t.spacing(4),
        paddingBlock: t.spacing(4),
      })}
    >
      <Box sx={t => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.spacing(2) })}>
        <Heading size='base'>{isActive ? 'SSO connection is active' : 'SSO connection configured'}</Heading>
        <Text
          render={p => <p {...p} />}
          intent='mutedForeground'
          sx={{ textWrap: 'balance' }}
        >
          {isActive
            ? `Anyone signing in with ${domain} must use your identity provider.`
            : `Your SSO connection is ready. Once activated, anyone signing in with ${domain} must use your identity provider.`}
        </Text>
      </Box>

      {snapshot.context.error && (
        <Text
          render={p => (
            <p
              role='alert'
              {...p}
            />
          )}
          intent='destructive'
        >
          {snapshot.context.error}
        </Text>
      )}

      {isActive ? (
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onExit}
        >
          Done
        </Button>
      ) : (
        <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2) })}>
          <Button
            type='button'
            size='sm'
            disabled={isBusy}
            onClick={() => send({ type: 'ACTIVATE' })}
          >
            Activate SSO
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isBusy}
            onClick={onExit}
          >
            Skip for now
          </Button>
        </Box>
      )}
    </Box>
  );
}
