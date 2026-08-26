import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-description">
        Page not found. The discipline path you're looking for doesn't exist.
      </p>
      <Link href="/" className="button-primary">
        Return to Dashboard
      </Link>
    </div>
  );
}