import { PricingTable, Protect } from '@clerk/nextjs';

export default async function PricingTablePage({
  searchParams,
}: {
  searchParams: Promise<{ newSubscriptionRedirectUrl: string }>;
}) {
  const newSubscriptionRedirectUrl = (await searchParams).newSubscriptionRedirectUrl;
  return (
    <>
      <Protect plan='free_user'>
        <p>user in free</p>
      </Protect>
      <Protect plan='pro'>
        <p>user in pro</p>
      </Protect>
      <Protect plan='plus'>
        <p>user in plus</p>
      </Protect>
      <PricingTable newSubscriptionRedirectUrl={newSubscriptionRedirectUrl} />
    </>
  );
}
