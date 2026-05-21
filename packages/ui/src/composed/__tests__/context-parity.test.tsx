import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useOptions } from '../../contexts/OptionsContext';
import { useModuleManager } from '../../contexts/ModuleManagerContext';
import { useFlowMetadata } from '../../elements/contexts';
import { useRouter } from '../../router';
import { useAppearance } from '../../customizables/AppearanceContext';

const ContextProbe = ({ testId }: { testId: string }) => {
  const environment = useEnvironment();
  const options = useOptions();
  const moduleManager = useModuleManager();
  const flowMetadata = useFlowMetadata();
  const router = useRouter();
  const appearance = useAppearance();

  return (
    <div data-testid={testId}>
      <span data-testid={`${testId}-env`}>{environment ? 'ok' : 'missing'}</span>
      <span data-testid={`${testId}-options`}>{options !== undefined ? 'ok' : 'missing'}</span>
      <span data-testid={`${testId}-module-manager`}>{moduleManager ? 'ok' : 'missing'}</span>
      <span data-testid={`${testId}-flow`}>{flowMetadata?.flow || 'missing'}</span>
      <span data-testid={`${testId}-router`}>{router ? 'ok' : 'missing'}</span>
      <span data-testid={`${testId}-appearance`}>{appearance ? 'ok' : 'missing'}</span>
    </div>
  );
};

describe('Context parity between portal and experimental paths', () => {
  describe('UserProfile context chain', () => {
    const { createFixtures } = bindCreateFixtures('UserProfile');

    it('all contexts are available in the portal path', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      render(<ContextProbe testId='portal' />, { wrapper });

      expect(screen.getByTestId('portal-env')).toHaveTextContent('ok');
      expect(screen.getByTestId('portal-options')).toHaveTextContent('ok');
      expect(screen.getByTestId('portal-module-manager')).toHaveTextContent('ok');
      expect(screen.getByTestId('portal-flow')).toHaveTextContent('UserProfile');
      expect(screen.getByTestId('portal-router')).toHaveTextContent('ok');
      expect(screen.getByTestId('portal-appearance')).toHaveTextContent('ok');
    });
  });

  describe('OrganizationProfile context chain', () => {
    const { createFixtures } = bindCreateFixtures('OrganizationProfile');

    it('all contexts are available in the portal path', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'TestOrg' }] });
      });

      render(<ContextProbe testId='portal' />, { wrapper });

      expect(screen.getByTestId('portal-env')).toHaveTextContent('ok');
      expect(screen.getByTestId('portal-options')).toHaveTextContent('ok');
      expect(screen.getByTestId('portal-module-manager')).toHaveTextContent('ok');
      expect(screen.getByTestId('portal-flow')).toHaveTextContent('OrganizationProfile');
      expect(screen.getByTestId('portal-router')).toHaveTextContent('ok');
      expect(screen.getByTestId('portal-appearance')).toHaveTextContent('ok');
    });
  });
});
