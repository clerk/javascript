import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { Flow, useAppearance, useLocalizations } from '../../customizables';
import { Route, Switch } from '../../router';

const BlankCard = withCardStateProvider(() => {
  const { parsedCaptcha } = useAppearance();
  const { locale } = useLocalizations();
  const captchaTheme = parsedCaptcha?.theme;
  const captchaSize = parsedCaptcha?.size;
  // Turnstile expects the language to be lowercase, so we convert it here (e.g. 'en-US' -> 'en-us')
  // Supported languages: https://developers.cloudflare.com/turnstile/reference/supported-languages
  const captchaLanguage = parsedCaptcha?.language || locale?.toLowerCase();

  return (
    <Card.Root>
      <Card.Content>
        <div
          id='cl-modal-captcha-container'
          data-cl-theme={captchaTheme}
          data-cl-size={captchaSize}
          data-cl-language={captchaLanguage}
        />
      </Card.Content>
    </Card.Root>
  );
});

function BlankCaptchaModal(): JSX.Element {
  return (
    <Route path='blank-captcha'>
      <div>
        <Flow.Root flow='blankCaptcha'>
          <Switch>
            <Route index>
              <BlankCard />
            </Route>
          </Switch>
        </Flow.Root>
      </div>
    </Route>
  );
}

BlankCaptchaModal.displayName = 'BlankCaptchaModal';

export { BlankCaptchaModal };
