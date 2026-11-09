import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <h1>Page not found</h1>
      <p>
        That page or scenario does not exist. <Link href="/">Go back to the scenarios</Link>.
      </p>
    </>
  );
}
