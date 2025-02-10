import { Flow } from '../../customizables';
import { Card, withCardStateProvider } from '../../elements';
import { Route, Switch } from '../../router';

const BlankCard = withCardStateProvider(() => {
  return (
    <Card.Root>
      <Card.Content>
        <div id='cl-modal-captcha-container' />
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
