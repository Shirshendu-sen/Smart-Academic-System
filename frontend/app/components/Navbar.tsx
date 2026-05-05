'use client';

import Link from 'next/link';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/courses' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'AI Quiz', href: '/quiz' },
    { label: 'AI Chat', href: '/chat' },
    { label: 'AI Summarize', href: '/summarize' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 p-2">
                <span className="text-xl font-bold text-white">🎓</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-neutral-900">Smart LMS</span>
                <span className="text-xs text-neutral-500">AI-Powered Learning</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <span className="text-lg">👤</span>
                <span>Account</span>
                <span className="text-lg">⌄</span>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-200 bg-white py-2 shadow-medium">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    Profile Settings
                  </Link>
                  <Link
                    href="/my-courses"
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    My Courses
                  </Link>
                  <div className="my-1 border-t border-neutral-200"></div>
                  <button className="block w-full px-4 py-2 text-left text-sm text-error-600 hover:bg-neutral-100">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            <Link
              href="/login"
              className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-primary-600 hover:to-primary-700 hover:shadow-md"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-primary-500 bg-white px-5 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <span className="text-2xl">✕</span>
            ) : (
              <span className="text-2xl">☰</span>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t border-neutral-200 py-4 md:hidden">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-lg px-4 py-3 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col space-y-3 border-t border-neutral-200 pt-4">
                <Link
                  href="/dashboard"
                  className="rounded-lg px-4 py-3 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3 text-center text-base font-semibold text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg border border-primary-500 bg-white px-4 py-3 text-center text-base font-semibold text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;