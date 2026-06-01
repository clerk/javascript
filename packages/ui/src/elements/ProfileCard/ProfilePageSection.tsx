import type { PropsWithChildren, ReactNode } from 'react';

import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';

import type { ProfilePageId } from '@clerk/shared/types';

import type { LocalizationKey } from '../../customizables';
import { Col, descriptors } from '../../customizables';
import type { ThemableCssProp } from '../../styledSystem';

type ProfilePageSectionProps = PropsWithChildren<{
  pageId: ProfilePageId;
  titleKey: LocalizationKey;
  alertContent?: ReactNode;
  outerSx?: ThemableCssProp;
}>;

export const ProfilePageSection = ({ children, pageId, titleKey, alertContent, outerSx }: ProfilePageSectionProps) => {
  return (
    <Col
      elementDescriptor={descriptors.page}
      sx={outerSx ?? (t => ({ gap: t.space.$8, isolation: 'isolate' }))}
    >
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId(pageId)}
      >
        <Header.Root>
          <Header.Title
            localizationKey={titleKey}
            sx={t => ({ marginBottom: t.space.$4 })}
            textVariant='h2'
          />
        </Header.Root>
        {alertContent !== undefined && <Card.Alert>{alertContent}</Card.Alert>}
        {children}
      </Col>
    </Col>
  );
};
