import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('./components/HomePage'), { ssr: false });

export const metadata = {
  title: 'Organizer - File Organization Made Easy',
  description: 'Automatically organize and categorize your files with AI-powered sorting',
};

export default function Page() {
  return <HomePage />;
} 