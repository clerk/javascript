import { Col, descriptors } from '../customizables';
import type { CustomPageContent } from '../utils';
import { ExternalElementMounter } from '../utils';

export const CustomPageContentContainer = ({ mount, unmount }: Omit<CustomPageContent, 'url'>) => {
  return (
    <Col
      elementDescriptor={descriptors.page}
      gap={8}
    >
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
};
