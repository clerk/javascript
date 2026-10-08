import { withCoreUserGuard } from '@/ui/contexts';
import { Flow } from '@/ui/customizables';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Route, Switch } from '@/ui/router';

import { useOAuthConsentController } from './oauth-consent.controller';
import { useOAuthConsentModel } from './oauth-consent.model';
import { OAuthConsentView } from './oauth-consent.view';

function OAuthConsentBody() {
  const model = useOAuthConsentModel();
  const controller = useOAuthConsentController(model);
  return <OAuthConsentView controller={controller} />;
}

const AuthenticatedRoutes = withCoreUserGuard(withCardStateProvider(OAuthConsentBody));

const OAuthConsentInternal = () => {
  return (
    <Flow.Root flow='oauthConsent'>
      <Flow.Part>
        <Switch>
          <Route>
            <AuthenticatedRoutes />
          </Route>
        </Switch>
      </Flow.Part>
    </Flow.Root>
  );
};

export const OAuthConsent = OAuthConsentInternal;
