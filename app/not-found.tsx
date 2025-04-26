'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-black">404</h1>
        <p className="text-xl text-gray-600">Page not found</p>
        <Link href="/">
          <button className="btn-primary flex items-center gap-2">
            <FiArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
} 