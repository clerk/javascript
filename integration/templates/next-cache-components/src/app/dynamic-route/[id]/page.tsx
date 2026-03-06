export default async function DynamicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main>
      <h1>Dynamic Route</h1>
      <p data-testid='route-id'>{id}</p>
    </main>
  );
}
