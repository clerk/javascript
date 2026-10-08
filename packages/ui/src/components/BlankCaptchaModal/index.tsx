import { withCardStateProvider } from '@/ui/elements/contexts';

import { Flow } from '../../customizables';
import { Route, Switch } from '../../router';
import { useBlankCaptchaModel } from './blank-captcha.model';
import { BlankCaptchaView } from './blank-captcha.view';

function BlankCardContent() {
  const model = useBlankCaptchaModel();
  return <BlankCaptchaView {...model} />;
}

const BlankCard = withCardStateProvider(BlankCardContent);

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
