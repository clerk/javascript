import { Button, descriptors, Icon, useLocalizations } from '@/customizables';
import { CaretLeft, CaretRight } from '@/icons';

import { ProfileCardFooter } from './elements/ProfileCard';
import { useFooterActions } from './elements/Wizard';

interface ConfigureSSOFooterProps {
  /** Override label for the Previous button */
  previousLabel?: string;
  /** Override label for the Continue button (also overridable per step via `useRegisterContinueAction({ label })`) */
  continueLabel?: string;
  /** Hides the Previous button entirely */
  hidePrevious?: boolean;
  /** Force-disables both Previous and Continue regardless of wizard state */
  isDisabled?: boolean;
}

/**
 * Shared Previous / Continue footer for the ConfigureSSO surface.
 * Dispatches to the deepest mounted wizard so Previous from a nested
 * sub-step lands on its own previous sibling instead of jumping out
 * to the parent wizard's previous main step
 */
export const ConfigureSSOFooter = ({
  previousLabel = 'Previous',
  continueLabel = 'Continue',
  hidePrevious = false,
  isDisabled = false,
}: ConfigureSSOFooterProps): JSX.Element => {
  const { continueAction, deepestWizard } = useFooterActions();
  const { t } = useLocalizations();

  const isForceDisabled = isDisabled;
  const isFirstStep = deepestWizard?.isFirstStep ?? true;
  const isLastStep = deepestWizard?.isLastStep ?? true;

  const continueLabelToShow =
    typeof continueAction?.label === 'string'
      ? continueAction.label
      : continueAction?.label
        ? t(continueAction.label)
        : continueLabel;

  const handleContinue = () => {
    if (continueAction?.handler) {
      void continueAction.handler();
      return;
    }
    void deepestWizard?.goNext();
  };

  const handlePrevious = () => {
    void deepestWizard?.goPrev();
  };

  return (
    <ProfileCardFooter>
      {!hidePrevious && (
        <Button
          elementDescriptor={descriptors.configureSSOWizardFooterPreviousButton}
          variant='outline'
          size='sm'
          isDisabled={isForceDisabled || isFirstStep}
          onClick={handlePrevious}
        >
          <Icon
            icon={CaretLeft}
            size='sm'
            sx={theme => ({ marginInlineEnd: theme.space.$1 })}
          />
          {previousLabel}
        </Button>
      )}
      <Button
        elementDescriptor={descriptors.configureSSOWizardFooterContinueButton}
        variant='solid'
        size='sm'
        isDisabled={isForceDisabled || continueAction?.isDisabled || isLastStep}
        isLoading={continueAction?.isLoading}
        onClick={handleContinue}
      >
        {continueLabelToShow}
        <Icon
          icon={CaretRight}
          size='sm'
          sx={theme => ({ marginInlineStart: theme.space.$1 })}
        />
      </Button>
    </ProfileCardFooter>
  );
};
