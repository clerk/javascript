import type { ProtectCheckFlow } from '@clerk/shared/types';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';

import {
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Flow,
  localizationKeys,
  Spinner,
  useLocalizations,
} from '../customizables';
import { useSpinDelay } from '../hooks';
import type { ProtectCheckRunner } from '../hooks/useProtectCheckRunner';

const localizationKeysByFlow = {
  signIn: {
    title: localizationKeys('signIn.protectCheck.title'),
    subtitle: localizationKeys('signIn.protectCheck.subtitle'),
    loading: localizationKeys('signIn.protectCheck.loading'),
    retryButton: localizationKeys('signIn.protectCheck.retryButton'),
  },
  signUp: {
    title: localizationKeys('signUp.protectCheck.title'),
    subtitle: localizationKeys('signUp.protectCheck.subtitle'),
    loading: localizationKeys('signUp.protectCheck.loading'),
    retryButton: localizationKeys('signUp.protectCheck.retryButton'),
  },
};

type ProtectCheckCardProps = {
  flow: ProtectCheckFlow;
  runner: ProtectCheckRunner;
};

export const ProtectCheckCard = ({ flow, runner }: ProtectCheckCardProps) => {
  const { containerRef, isRunning, isWidgetVisible, hasError, retry } = runner;
  const card = useCardState();
  const { t } = useLocalizations();
  const keys = localizationKeysByFlow[flow];

  // Debounce the spinner's entrance so a near-instant check (or a script that signals its
  // widget immediately) never flashes it. The error and widget-visibility gates stay outside
  // the delay hook: its minimum visible duration must never outrank the handshake's "spinner is
  // gone when the promise resolves" guarantee, nor keep a spinner next to the retry button.
  const showSpinner = useSpinDelay(isRunning, { delay: 300 });

  return (
    <Flow.Part part='protectCheck'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={keys.title} />
            <Header.Subtitle localizationKey={keys.subtitle} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          <Col
            elementDescriptor={descriptors.main}
            gap={6}
          >
            <Box
              ref={containerRef}
              id='clerk-protect-check'
              aria-busy={isRunning}
              // Out of flow while empty so the collapsed container adds no reserved height or flex-gap
              // gutter above the spinner (same idiom as CaptchaElement's `gapless` mode).
              style={{ display: 'block', alignSelf: 'center', position: isWidgetVisible ? 'static' : 'absolute' }}
            />
            {showSpinner && !hasError && !isWidgetVisible ? (
              <Flex center>
                <Spinner
                  size='lg'
                  colorScheme='primary'
                  elementDescriptor={descriptors.spinner}
                  aria-label={t(keys.loading)}
                />
              </Flex>
            ) : null}
            {hasError ? (
              <Button
                onClick={retry}
                localizationKey={keys.retryButton}
              />
            ) : null}
          </Col>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};
