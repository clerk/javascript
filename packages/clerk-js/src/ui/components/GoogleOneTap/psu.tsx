import { Col, descriptors, Flow } from '../../customizables';
import { Card, Header, LoadingCard, useCardState, withCardStateProvider } from '../../elements';
import { useLoadingStatus } from '../../hooks';
import { animations } from '../../styledSystem';

export function _PSU(): JSX.Element {
  const card = useCardState();

  const status = useLoadingStatus();

  if (status.isLoading) {
    return <LoadingCard />;
  }

  return (
    <Flow.Part part='psu'>
      <Card.Root
        id={'one-tap'}
        sx={t => ({
          animation: `${animations.fadeIn} 150ms ${t.transitionTiming.$common}`,
          zIndex: t.zIndices.$modal,
          overflow: 'auto',
          width: 'fit-content',
          height: 'fit-content',
          position: 'fixed',
          right: 0,
          top: 0,
        })}
      >
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={'Missing fields'} />
            <Header.Subtitle localizationKey={'Fill the requested information'} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          <Col
            elementDescriptor={descriptors.main}
            gap={6}
          >
            Some form
          </Col>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
}

export const OneTapPSU = withCardStateProvider(_PSU);
