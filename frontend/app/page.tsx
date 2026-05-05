export default function Home() {
  return (
    <div className="text-center py-8 sm:py-12 lg:py-16">
      <div className="mb-10 sm:mb-12 lg:mb-16">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4 sm:text-5xl lg:text-6xl">
          Welcome to the{' '}
          <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Smart Academic Platform
          </span>
        </h1>
        <p className="text-lg text-neutral-600 mb-8 max-w-3xl mx-auto sm:text-xl">
          An AI-powered Learning Management System that auto-generates quizzes, provides instant doubt resolution,
          and tracks student progress using Google Gemini AI.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 my-10 lg:my-12">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-neutral-200 hover:shadow-medium transition-shadow duration-300 lg:p-8">
          <div className="text-5xl mb-5">🤖</div>
          <h3 className="text-xl font-bold mb-3 text-neutral-900 lg:text-2xl">AI Quiz Generator</h3>
          <p className="text-neutral-600">
            Upload lecture notes and instantly generate 10 multiple-choice questions with AI.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-neutral-200 hover:shadow-medium transition-shadow duration-300 lg:p-8">
          <div className="text-5xl mb-5">💬</div>
          <h3 className="text-xl font-bold mb-3 text-neutral-900 lg:text-2xl">AI Doubt Chatbot</h3>
          <p className="text-neutral-600">
            Get instant answers to your course-related questions from an AI tutor.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-neutral-200 hover:shadow-medium transition-shadow duration-300 lg:p-8">
          <div className="text-5xl mb-5">📊</div>
          <h3 className="text-xl font-bold mb-3 text-neutral-900 lg:text-2xl">Progress Analytics</h3>
          <p className="text-neutral-600">
            Track your learning journey with detailed analytics and personalized recommendations.
          </p>
        </div>
      </div>
      
      <div className="mt-12 lg:mt-16">
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
          <a
            href="/dashboard"
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-primary-600 hover:to-primary-700 hover:shadow-hard transition-all duration-300 inline-block"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="bg-white text-primary-600 border-2 border-primary-500 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-50 transition-colors duration-300 inline-block"
          >
            Login
          </a>
        </div>
        <p className="mt-8 text-sm text-neutral-500">
          Join over 10,000 educators and students already using Smart LMS.
        </p>
      </div>

      {/* Stats Section */}
      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-700">10K+</div>
          <div className="text-neutral-600 text-sm">Active Users</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-700">500+</div>
          <div className="text-neutral-600 text-sm">Courses</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-700">95%</div>
          <div className="text-neutral-600 text-sm">Satisfaction</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-700">24/7</div>
          <div className="text-neutral-600 text-sm">AI Support</div>
        </div>
      </div>
    </div>
  )
}