import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <span className="text-xl font-bold">D</span>
      <span className="ml-2 text-lg font-semibold hidden md:block">Discipline OS</span>
    </Link>
  );
}