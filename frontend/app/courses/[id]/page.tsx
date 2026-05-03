'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: { name: string; id: number };
  thumbnail_url: string;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  video_url: string;
  order_index: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id;

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => axios.get(`/api/courses/${courseId}`).then(r => r.data),
    enabled: !!courseId,
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: () => axios.get(`/api/enrollments/check?courseId=${courseId}`).then(r => r.data),
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Course not found</h1>
        <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
        <Link href="/courses" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>
          {enrollment?.enrolled ? (
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
              ✅ Enrolled
            </span>
          ) : (
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Enroll Now
            </button>
          )}
        </div>
        <p className="text-gray-600 mt-4 max-w-3xl">{course.description}</p>
        <div className="mt-4 text-sm text-gray-500">
          Instructor: <span className="font-medium">{course.instructor.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Lessons</h2>
          <div className="space-y-4">
            {course.lessons?.map((lesson) => (
              <div key={lesson.id} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{lesson.title}</h3>
                    <p className="text-gray-600 mt-2 line-clamp-2">{lesson.content?.substring(0, 150)}...</p>
                  </div>
                  <Link
                    href={`/lessons/${lesson.id}`}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Start Lesson
                  </Link>
                </div>
                {lesson.video_url && (
                  <div className="mt-4 text-sm text-gray-500 flex items-center">
                    <span className="mr-2">🎥</span> Video available
                  </div>
                )}
              </div>
            ))}
          </div>
          {course.lessons?.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No lessons yet</h3>
              <p className="text-gray-600">Lessons will be added by the instructor soon.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Course Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                ✨ Generate AI Quiz
              </button>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                💬 Ask AI Doubt
              </button>
              <button className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition">
                📝 Summarize with AI
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>📊 Start learning to track your progress.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}