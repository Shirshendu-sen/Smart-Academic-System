'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: { name: string };
  thumbnail_url: string;
  isPublished: boolean;
}

export default function CoursesPage() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => axios.get('/api/courses').then(r => r.data),
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Browse Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-5 animate-pulse">
              <div className="h-40 bg-gray-300 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
        <div className="text-sm text-gray-600">
          {courses?.length || 0} courses available
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {courses?.map((course: Course) => (
          <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-4xl">📚</span>
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                {!course.isPublished && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Draft</span>
                )}
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Instructor: <span className="font-medium">{course.instructor.name}</span>
                </div>
                <Link
                  href={`/courses/${course.id}`}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  View Course
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📖</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No courses yet</h3>
          <p className="text-gray-600">Check back later or create your own course if you're an instructor.</p>
        </div>
      )}
    </div>
  );
}