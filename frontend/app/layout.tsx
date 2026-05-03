import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import QueryClientProvider from './QueryClientProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart Academic Platform - AI-Powered LMS',
  description: 'An AI-powered Learning Management System with auto-generated quizzes, doubt resolution, and progress tracking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} flex min-h-screen flex-col bg-gradient-to-b from-white to-neutral-50`}>
        <QueryClientProvider>
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </QueryClientProvider>
      </body>
    </html>
  )
}