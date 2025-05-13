import { PricingTable } from '@clerk/nextjs';

export default async function PricingTablePage({
  searchParams,
}: {
  searchParams: Promise<{ newSubscriptionRedirectUrl: string }>;
}) {
  const newSubscriptionRedirectUrl = (await searchParams).newSubscriptionRedirectUrl;
  return <PricingTable newSubscriptionRedirectUrl={newSubscriptionRedirectUrl} />;
}
