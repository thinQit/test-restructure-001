'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Tasks' },
  { href: '/tasks/new', label: 'Create Task' }
];

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold" aria-label="Task Manager home">
          Task Manager
        </Link>
        <button
          className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm sm:hidden"
          onClick={() => setOpen(prev => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          ☰
        </button>
        <div className="hidden items-center gap-6 sm:flex">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground">
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-secondary">{user?.name || user?.email}</span>
              <Button variant="ghost" size="sm" onClick={logout} aria-label="Log out">
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" aria-label="Login">
                Login
              </Button>
              <Button variant="secondary" size="sm" aria-label="Sign up">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </nav>
      {open && (
        <div className="border-t border-border px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground">
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Button variant="ghost" size="sm" onClick={logout} aria-label="Log out">
                Logout
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" aria-label="Login">
                  Login
                </Button>
                <Button variant="secondary" size="sm" aria-label="Sign up">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navigation;
