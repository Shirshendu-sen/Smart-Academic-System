'use client';

import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'API', href: '/api' },
      { label: 'Documentation', href: '/docs' },
    ],
    Company: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
    ],
    Support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Status', href: '/status' },
      { label: 'Community', href: '/community' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/gdpr' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com', icon: '🐦' },
    { name: 'GitHub', href: 'https://github.com', icon: '🐙' },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: '💼' },
    { name: 'Discord', href: 'https://discord.com', icon: '🎮' },
    { name: 'YouTube', href: 'https://youtube.com', icon: '📺' },
  ];

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 p-2">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Smart LMS</h2>
                <p className="mt-2 text-neutral-600">
                  AI-powered Learning Management System with auto-generated quizzes, doubt resolution, and progress tracking.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-neutral-500">
                Join 10,000+ educators and students transforming education with AI.
              </p>
              <div className="mt-6 flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
                    aria-label={social.name}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                {category}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-600 transition-colors hover:text-primary-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-neutral-300 pt-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-sm text-neutral-600">
                © {currentYear} Smart Academic Platform. All rights reserved.
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Built with Next.js, Node.js, and Google Gemini AI.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-6 md:mt-0">
              <span className="text-xs text-neutral-500">🌐 English (US)</span>
              <span className="text-xs text-neutral-500">💵 USD</span>
              <button className="text-xs text-primary-600 hover:underline">
                Accessibility
              </button>
              <button className="text-xs text-primary-600 hover:underline">
                Sitemap
              </button>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-neutral-500">
            <p>
              Smart LMS is a product of Smart Academic Platform Inc. • 123 Education Street, San Francisco, CA 94107 •{' '}
              <a href="mailto:hello@smartlms.com" className="text-primary-600 hover:underline">
                hello@smartlms.com
              </a>
            </p>
            <p className="mt-2">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="/privacy" className="text-primary-600 hover:underline">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/terms" className="text-primary-600 hover:underline">
                Terms of Service
              </a>{' '}
              apply.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;