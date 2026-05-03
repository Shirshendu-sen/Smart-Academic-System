'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

interface Lesson {
  id: number;
  title: string;
  content: string;
  video_url: string;
  course: { id: number; title: string };
}

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id;
  const [activeTab, setActiveTab] = useState<'content' | 'quiz' | 'chat' | 'summary'>('content');

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => axios.get(`/api/lessons/${lessonId}`).then(r => r.data),
    enabled: !!lessonId,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 bg-gray-300 rounded w-1/2 mb-6 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-64 bg-gray-300 rounded mb-6"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Lesson not found</h1>
        <p className="text-gray-600">The lesson you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <nav className="text-sm text-gray-600 mb-4">
          <a href="/dashboard" className="hover:text-blue-600">Dashboard</a> >{' '}
          <a href={`/courses/${lesson.course.id}`} className="hover:text-blue-600">{lesson.course.title}</a> >{' '}
          <span className="font-medium">{lesson.title}</span>
        </nav>
        <h1 className="text-4xl font-bold text-gray-900">{lesson.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                {(['content', 'quiz', 'chat', 'summary'] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`px-6 py-4 font-medium text-sm uppercase tracking-wide transition ${activeTab === tab
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'content' && '📖 Lesson Content'}
                    {tab === 'quiz' && '🤖 AI Quiz'}
                    {tab === 'chat' && '💬 AI Doubt Chat'}
                    {tab === 'summary' && '📝 AI Summary'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              {activeTab === 'content' && (
                <div>
                  {lesson.video_url && (
                    <div className="mb-8">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <iframe
                          src={lesson.video_url.replace('watch?v=', 'embed/')}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                  <div className="prose max-w-none">
                    <h2 className="text-2xl font-bold mb-4">Lecture Notes</h2>
                    <div className="whitespace-pre-line text-gray-800">{lesson.content}</div>
                  </div>
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">🤖</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Quiz Generator</h3>
                  <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    Generate a custom quiz based on this lesson's content. The AI will create 10 multiple‑choice questions to test your understanding.
                  </p>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition">
                    Generate Quiz
                  </button>
                  <p className="mt-6 text-sm text-gray-500">
                    Quiz will be saved to your profile and can be retaken anytime.
                  </p>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="py-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Ask AI Tutor</h3>
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="flex items-start mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <span className="text-blue-600">AI</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800">
                          Hello! I'm your AI tutor. Ask me anything about "{lesson.title}". I'll answer based on the lesson content.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Type your question..."
                      className="flex-1 border border-gray-300 rounded-l-lg px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="bg-blue-600 text-white px-8 py-4 rounded-r-lg font-semibold hover:bg-blue-700">
                      Send
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'summary' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">AI‑Generated Summary</h3>
                  <p className="text-gray-600 mb-8">
                    Get a concise summary of this lesson with key points, definitions, and a quick overview.
                  </p>
                  <button className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition">
                    Generate Summary
                  </button>
                  <div className="mt-12 border-t border-gray-200 pt-8">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Example Summary</h4>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <ul className="space-y-3 list-disc pl-5">
                        <li>This lesson introduces fundamental concepts.</li>
                        <li>Key terms: Definition 1, Definition 2.</li>
                        <li>The main takeaway is...</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Lesson Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Completion</span>
                <span className="font-bold text-blue-600">0%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                Mark as Completed
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Next Steps</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">1</div>
                <span>Complete this lesson</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">2</div>
                <span>Take the AI quiz</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3">3</div>
                <span>Ask doubts if any</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}