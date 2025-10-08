import { Flow, localizationKeys } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';

const SignInChooseEnterpriseConnectionInternal = () => {
  const card = useCardState();

  return (
    <Flow.Part part='chooseEnterpriseConnection'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('signIn.chooseEnterpriseConnection.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.chooseEnterpriseConnection.subtitle')} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
        </Card.Content>
      </Card.Root>
    </Flow.Part>
  );
};

export const SignInChooseEnterpriseConnection = withRedirectToAfterSignIn(
  withCardStateProvider(SignInChooseEnterpriseConnectionInternal),
);
