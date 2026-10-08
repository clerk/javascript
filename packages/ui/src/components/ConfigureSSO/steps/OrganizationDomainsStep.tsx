import { RemoveDomainDialog } from '../RemoveDomainDialog';
import { DomainCard } from './DomainCard';
import { DomainsField } from './DomainsField';
import { DomainSuggestion } from './DomainSuggestion';
import { useOrganizationDomainsStepController } from './organization-domains-step.controller';
import { useOrganizationDomainsStepModel } from './organization-domains-step.model';
import { OrganizationDomainsStepView } from './organization-domains-step.view';

export const OrganizationDomainsStep = (): JSX.Element => {
  const model = useOrganizationDomainsStepModel();
  const controller = useOrganizationDomainsStepController(model);
  const domainToRemove = controller.domainToRemove;

  return (
    <OrganizationDomainsStepView
      title={model.title}
      subtitle={model.subtitle}
      error={controller.error}
      goPrev={controller.goPrev}
      goNext={controller.goNext}
      isFirstStep={controller.isFirstStep}
      isLastStep={controller.isLastStep}
      domainsReady={model.domainsReady}
      hasOrganizationDomains={Boolean(model.organizationDomains?.length)}
      domainsField={
        <DomainsField
          key={model.scopeKey}
          onSubmit={controller.handleCreateDomain}
          domainNames={model.domainNames}
        />
      }
      domainSuggestion={
        !model.organizationDomains?.length && (
          <DomainSuggestion
            key={model.scopeKey}
            onSubmit={controller.handleCreateDomain}
          />
        )
      }
      domainCards={model.organizationDomains?.map(domain => {
        const isSelected = model.connectionDomains.includes(domain.name);
        const isLocked = isSelected && model.lockLastConnectionDomain;
        return (
          <DomainCard
            key={`${model.scopeKey}:${domain.id}`}
            domain={domain}
            isSelected={isSelected}
            claimedBy={model.claimedDomains.get(domain.name)}
            onToggle={checked => void controller.handleToggleDomain(domain.name, checked)}
            isToggleDisabled={isLocked || controller.isUpdatingDomains}
            onRemove={() =>
              controller.selectDomainForRemoval({ name: domain.name, remove: () => model.removeDomain(domain) })
            }
            onPrepareOwnershipVerification={() => controller.handlePrepareOwnershipVerification(domain.id)}
            isRemoveDisabled={isLocked}
            removeDisabledTooltip={model.lastConnectionDomainTooltip}
          />
        );
      })}
      removeDomainDialog={
        domainToRemove && (
          <RemoveDomainDialog
            scopeKey={model.scopeKey}
            canRun={model.canRun}
            isOpen={!!domainToRemove}
            onClose={controller.closeRemoveDialog}
            domain={domainToRemove.name}
            isConnectionActive={model.isConnectionActive}
            onRemove={domainToRemove.remove}
            contentRef={model.contentRef}
          />
        )
      }
    />
  );
};
