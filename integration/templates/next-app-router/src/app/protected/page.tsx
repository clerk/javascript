import Link from 'next/link';

export default function Page() {
  return (
    <>
      <div data-testid='protected'>Protected</div>
      <Link href='/'>Home</Link>
    </>
  );
}
