'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HeaderProps {
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.refresh();
    });
  };

  return (
    <header className="border-b bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Task Management</h1>
            <p className="text-sm text-gray-300">Welcome, {user.name}</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <nav className="flex gap-2 flex-wrap">
              <Link href="/todos">
                <Button variant="secondary" size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                  🏠 Home
                </Button>
              </Link>
            </nav>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              disabled={isPending}
              className="bg-transparent text-white border-white hover:bg-white hover:text-gray-900 disabled:opacity-50"
            >
              {isPending ? '...' : '🚪 Logout'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
