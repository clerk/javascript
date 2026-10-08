import { Card } from '@/ui/elements/Card';

import type { BlankCaptchaModel } from './blank-captcha.model';

export function BlankCaptchaView({ theme, size, language }: BlankCaptchaModel) {
  return (
    <Card.Root>
      <Card.Content>
        <div
          id='cl-modal-captcha-container'
          data-cl-theme={theme}
          data-cl-size={size}
          data-cl-language={language}
        />
      </Card.Content>
    </Card.Root>
  );
}
