import type { EnhancedPage } from './app';

export const createKeylessPopoverPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;
  // TODO: Is this the ID we really want ?
  const elementId = '#--clerk-keyless-prompt-button';
  const contentId = '#--clerk-keyless-prompt-content';
  const self = {
    waitForMounted: () => page.waitForSelector(elementId, { state: 'attached' }),
    waitForUnmounted: () => page.waitForSelector(elementId, { state: 'detached' }),
    isExpanded: () =>
      page
        .locator(elementId)
        .getAttribute('aria-expanded')
        .then(val => val === 'true'),
    toggle: () => page.locator(elementId).click(),

    promptsToClaim: () => {
      return page.getByRole('link', { name: /^configure your application$/i });
    },
    promptToUseClaimedKeys: () => {
      return page.getByRole('link', { name: /^get api keys$/i });
    },
    promptToDismiss: () => {
      return page.getByRole('button', { name: /^dismiss$/i });
    },

    // Helper methods to check content text for different states
    getSignedInContent: () => {
      return {
        title: page.getByText("You've created your first user", { exact: false }),
        description: page.getByText(/Head to the dashboard to customize authentication settings/i),
        bulletList: page.locator(contentId).locator('ul'),
        bulletItems: page.locator(contentId).getByText(/Add SSO connections|Set up B2B authentication|Enable MFA/i),
      };
    },
    getNotSignedInContent: () => {
      return {
        title: page.locator(elementId).getByText('Configure your application', { exact: false }),
        temporaryKeysText: page.getByText(/Temporary API keys are enabled/i),
        bulletList: page.locator(contentId).locator('ul'),
        bulletItems: page.locator(contentId).getByText(/Add SSO connections|Set up B2B authentication|Enable MFA/i),
        dashboardText: page.getByText(/Access the dashboard to customize auth settings/i),
      };
    },
    getSuccessContent: () => {
      return {
        title: page.getByText('Your app is ready', { exact: false }),
        configuredText: page.getByText(/has been configured/i),
        dashboardLink: page.getByRole('link', { name: /Clerk dashboard/i }),
      };
    },
    getClaimedContent: () => {
      return {
        title: page.getByText('Missing environment keys', { exact: false }),
        description: page.getByText(/You claimed this application but haven't set keys/i),
      };
    },
  };
  return self;
};
