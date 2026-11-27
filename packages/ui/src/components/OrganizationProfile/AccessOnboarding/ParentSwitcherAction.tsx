import { useClerk } from '@clerk/shared/react';

import { Action } from '@/ui/elements/Actions';

import { descriptors } from '../../../customizables';
import { ArrowRight } from '../../../icons';
import { protoKey, useAccessPrototype } from './prototypeState';

/*
 * Prototype-only: parent members go into the parent from the organization
 * switcher. The parent is never the active organization; this opens its
 * management view instead.
 */
export const ParentSwitcherAction = ({ onOpen }: { onOpen?: () => void }) => {
  const { openOrganizationProfile } = useClerk();
  const { hierarchy, setScenario } = useAccessPrototype();
  if (hierarchy?.role !== 'child' || !hierarchy.isParentMember) {
    return null;
  }
  return (
    <Action
      elementDescriptor={descriptors.organizationSwitcherPopoverActionButton}
      elementId={descriptors.organizationSwitcherPopoverActionButton.setId('manageOrganization')}
      iconBoxElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIconBox}
      iconElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIcon}
      icon={ArrowRight}
      label={protoKey(`Manage ${hierarchy.parentName}`)}
      onClick={() => {
        setScenario('parent');
        onOpen?.();
        openOrganizationProfile();
      }}
      sx={t => ({ padding: `${t.space.$4} ${t.space.$5}` })}
      iconSx={t => ({ width: t.sizes.$9, height: t.sizes.$4 })}
      iconBoxSx={t => ({ width: t.sizes.$9, height: t.sizes.$9 })}
    />
  );
};
