import { Suspense } from 'react';

async function DynamicContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <p data-testid='route-id'>{id}</p>;
}

export default function DynamicPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      <h1>Dynamic Route</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicContent params={params} />
      </Suspense>
    </main>
  );
}
