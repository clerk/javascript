import { useState } from 'react';

import { useFooterResetModel } from './footer-reset.model';
import { FooterResetView } from './footer-reset.view';

/**
 * The destructive reset affordance, rendered in a step footer. Self-hides while
 * there is no connection (so it only shows on configure / test / confirmation,
 * never on verify-domain / select-provider).
 *
 * It deliberately does NOT call `useWizard()`. The confirm path deletes the
 * connection directly via the context mutation (a pure delete; the wizard then
 * self-corrects to the furthest-reachable step when the active step's guard
 * breaks), so this works from ANY footer — including the nested SAML configure
 * footers, which have their own (linear) wizard. That is what kills the old
 * per-step nested-binding trap.
 *
 * `marginInlineEnd: 'auto'` pushes it to the far-left of the `justify='end'`
 * footer row, matching the prior destructive affordance.
 */
export const FooterReset = (): JSX.Element | null => {
  const model = useFooterResetModel();
  return model.dialog ? (
    <FooterResetContent
      key={model.dialog.requestKey}
      dialog={model.dialog}
    />
  ) : null;
};
FooterReset.displayName = 'Step.Footer.Reset';

const FooterResetContent = ({ dialog }: { dialog: NonNullable<ReturnType<typeof useFooterResetModel>['dialog']> }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <FooterResetView
      dialog={dialog}
      isOpen={isOpen}
      open={() => setIsOpen(true)}
      close={() => setIsOpen(false)}
    />
  );
};
