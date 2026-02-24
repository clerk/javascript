export default async function Page({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

  return (
    <div>
      <p data-testid='current-org-id'>{orgId}</p>
    </div>
  );
}
