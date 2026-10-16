import { Confirmation } from '../../../blocks/confirmation';
import { Section } from '../../../components/section';
import { fill, useMessages } from '../../../localization';
import { truncateWithEndVisible } from '../../../utils/truncate-text-with-end-visible';
import { UserProfileWeb3WalletRowView } from './user-profile-web3-wallet-row.view';
import type { UserProfileWeb3WalletsSectionViewProps } from './user-profile-web3-wallets-section.types';

export function UserProfileWeb3WalletsSectionView({
  wallets,
  sectionRef,
  availableProviders = [],
  pendingId,
  onConnect,
  onSetPrimary,
  registerTrigger,
  remove,
  finalFocus,
}: UserProfileWeb3WalletsSectionViewProps) {
  const m = useMessages('userProfileWeb3Wallets');
  const hasRows = wallets.length > 0 || (availableProviders.length > 0 && Boolean(onConnect));
  const isBusy = pendingId !== undefined;

  return (
    <>
      {hasRows ? (
        <Section.Root>
          <Section.Group
            ref={sectionRef}
            tabIndex={-1}
          >
            <Section.Header>
              <Section.Content>
                <Section.Title>{m.title}</Section.Title>
              </Section.Content>
            </Section.Header>
            <Section.Body>
              {wallets.map(wallet => (
                <UserProfileWeb3WalletRowView
                  key={wallet.id}
                  wallet={wallet}
                  triggerRef={registerTrigger(wallet.id)}
                  isDisabled={isBusy}
                  onSetPrimary={onSetPrimary}
                  onRemove={remove ? wallet => remove.open(wallet) : undefined}
                />
              ))}
              {onConnect
                ? availableProviders.map(provider => (
                    <UserProfileWeb3WalletRowView
                      key={provider.id}
                      wallet={provider}
                      isPending={pendingId === provider.id}
                      isDisabled={isBusy}
                      onConnect={onConnect}
                    />
                  ))
                : null}
            </Section.Body>
          </Section.Group>
        </Section.Root>
      ) : null}
      {remove ? (
        <Confirmation
          controller={remove}
          title={m.removeDialog.title}
          description={wallet =>
            fill(wallet.isVerified ? m.removeDialog.verifiedDescription : m.removeDialog.description, {
              wallet: truncateWithEndVisible(wallet.address, 13, 4),
            })
          }
          actionLabel={m.removeDialog.confirm}
          cancelLabel={m.removeDialog.cancel}
          finalFocus={finalFocus}
        />
      ) : null}
    </>
  );
}
