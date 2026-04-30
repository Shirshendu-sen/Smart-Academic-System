import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-md py-4 px-6">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">
              🎓 Smart LMS
            </div>
            <div className="space-x-4">
              <a href="/login" className="text-gray-600 hover:text-blue-600">Login</a>
              <a href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign Up</a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto py-8">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="container mx-auto text-center">
            <p>© 2024 Smart Academic Platform. Built with Next.js, Node.js, and Google Gemini AI.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}