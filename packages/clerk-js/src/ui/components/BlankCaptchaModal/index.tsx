import { Flow, useAppearance, useLocalizations } from '../../customizables';
import { Card, withCardStateProvider } from '../../elements';
import { Route, Switch } from '../../router';

const BlankCard = withCardStateProvider(() => {
  const { parsedCaptcha } = useAppearance();
  const { locale } = useLocalizations();
  const captchaTheme = parsedCaptcha?.theme;
  const captchaSize = parsedCaptcha?.size;
  const captchaLanguage = parsedCaptcha?.language || locale;

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
