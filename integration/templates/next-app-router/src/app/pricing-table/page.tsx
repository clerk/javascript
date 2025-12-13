import { PricingTable, Show } from '@clerk/nextjs';

export default async function PricingTablePage({
  searchParams,
}: {
  searchParams: Promise<{ newSubscriptionRedirectUrl: string }>;
}) {
  const newSubscriptionRedirectUrl = (await searchParams).newSubscriptionRedirectUrl;
  return (
    <>
      <Show when={{ plan: 'free_user' }}>
        <p>user in free</p>
      </Show>
      <Show when={{ plan: 'pro' }}>
        <p>user in pro</p>
      </Show>
      <Show when={{ plan: 'plus' }}>
        <p>user in plus</p>
      </Show>
      <PricingTable newSubscriptionRedirectUrl={newSubscriptionRedirectUrl} />
    </>
  );
}
