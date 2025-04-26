'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-black">500</h1>
        <p className="text-xl text-gray-600">Something went wrong</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => reset()} className="btn-primary">
            Try again
          </button>
          <Link href="/">
            <button className="btn-secondary flex items-center gap-2">
              <FiArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 