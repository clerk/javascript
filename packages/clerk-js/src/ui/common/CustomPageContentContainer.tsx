import { Col, descriptors } from '../customizables';
import { Card, useCardState, withCardStateProvider } from '../elements';
import type { CustomPageContent } from '../utils';
import { ExternalElementMounter } from '../utils';

export const CustomPageContentContainer = withCardStateProvider(
  ({ mount, unmount }: Omit<CustomPageContent, 'url'>) => {
    const card = useCardState();
    return (
      <Col
        elementDescriptor={descriptors.page}
        gap={8}
      >
        <Card.Alert>{card.error}</Card.Alert>
        <Col
          elementDescriptor={descriptors.profilePage}
          gap={8}
        >
          <ExternalElementMounter
            mount={mount}
            unmount={unmount}
          />
        </Col>
      </Col>
    );
  },
);
