export default function Home() {
  return (
    <div className="text-center py-12">
      <h1 className="text-5xl font-bold text-gray-800 mb-6">
        Welcome to the <span className="text-blue-600">Smart Academic Platform</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        An AI-powered Learning Management System that auto-generates quizzes, provides instant doubt resolution, 
        and tracks student progress using Google Gemini AI.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-2xl font-bold mb-3">AI Quiz Generator</h3>
          <p className="text-gray-600">
            Upload lecture notes and instantly generate 10 multiple-choice questions with AI.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-2xl font-bold mb-3">AI Doubt Chatbot</h3>
          <p className="text-gray-600">
            Get instant answers to your course-related questions from an AI tutor.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-2xl font-bold mb-3">Progress Analytics</h3>
          <p className="text-gray-600">
            Track your learning journey with detailed analytics and personalized recommendations.
          </p>
        </div>
      </div>
      
      <div className="mt-12">
        <a 
          href="/dashboard" 
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition inline-block mr-4"
        >
          Get Started
        </a>
        <a 
          href="/login" 
          className="bg-white text-blue-600 border border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition inline-block"
        >
          Login
        </a>
      </div>
    </div>
  )
}