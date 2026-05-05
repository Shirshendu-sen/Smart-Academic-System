'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import axios from 'axios';

// Define quiz schema inline to avoid import issues
const quizSchema = z.object({
  courseId: z.string().nonempty({ message: 'Course is required' }),
  lessonId: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  numQuestions: z.number().int().min(1).max(20),
});

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResult {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  difficulty: string;
  timeLimit: number;
}

type QuizFormData = {
  courseId: string;
  lessonId?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  numQuestions: number;
};

export default function QuizPage() {
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'quiz'>('generate');
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
  } = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    mode: 'onChange',
    defaultValues: {
      courseId: '',
      lessonId: '',
      difficulty: 'medium',
      numQuestions: 5,
    },
  });

  // Fetch available courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await axios.get('/api/courses');
      return response.data;
    },
  });

  // Generate quiz mutation
  const generateQuizMutation = useMutation({
    mutationFn: async (data: QuizFormData) => {
      const response = await axios.post('/api/ai/quiz', {
        courseId: data.courseId,
        lessonId: data.lessonId || undefined,
        difficulty: data.difficulty,
        numQuestions: data.numQuestions,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setQuizResult(data);
      setActiveTab('quiz');
      setSelectedAnswers(new Array(data.questions.length).fill(-1));
      setSubmitted(false);
      toast.success('Quiz generated successfully!');
    },
    onError: (error: any) => {
      console.error('Quiz generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate quiz');
    },
  });

  const onSubmit = (data: QuizFormData) => {
    generateQuizMutation.mutate(data);
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
    const correctCount = quizResult!.questions.reduce((count, question, idx) => {
      return count + (selectedAnswers[idx] === question.correctAnswer ? 1 : 0);
    }, 0);
    const score = Math.round((correctCount / quizResult!.totalQuestions) * 100);
    toast.success(`Quiz submitted! Score: ${score}%`);
  };

  const handleReset = () => {
    reset();
    setQuizResult(null);
    setActiveTab('generate');
    setSelectedAnswers([]);
    setSubmitted(false);
  };

  const courseIdValue = watch('courseId');
  const difficultyValue = watch('difficulty');
  const numQuestionsValue = watch('numQuestions');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Quiz Generator</h1>
      <p className="text-gray-600 mb-8">
        Generate custom quizzes from your course materials. Test your knowledge with AI‑generated questions.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left panel: Quiz generation form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  className={`px-6 py-4 font-medium text-lg ${activeTab === 'generate' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('generate')}
                >
                  Generate Quiz
                </button>
                <button
                  className={`px-6 py-4 font-medium text-lg ${activeTab === 'quiz' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('quiz')}
                  disabled={!quizResult}
                >
                  Take Quiz
                </button>
              </div>
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === 'generate' ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Course *
                      </label>
                      <select
                        {...register('courseId')}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={coursesLoading}
                      >
                        <option value="">-- Choose a course --</option>
                        {courses?.map((course: any) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                      {errors.courseId && (
                        <p className="mt-1 text-sm text-red-600">{errors.courseId.message}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Selecting a course helps AI generate relevant questions.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson (Optional)
                      </label>
                      <input
                        type="text"
                        {...register('lessonId')}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter lesson ID or title"
                      />
                      {errors.lessonId && (
                        <p className="mt-1 text-sm text-red-600">{errors.lessonId.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty *
                      </label>
                      <div className="flex space-x-4">
                        {['easy', 'medium', 'hard'].map((level) => (
                          <button
                            key={level}
                            type="button"
                            className={`px-4 py-2 rounded-lg ${difficultyValue === level ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            onClick={() => setValue('difficulty', level as any, { shouldValidate: true })}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                      {errors.difficulty && (
                        <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Questions *
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200"
                          onClick={() => setValue('numQuestions', Math.max(1, numQuestionsValue - 1), { shouldValidate: true })}
                        >
                          –
                        </button>
                        <input
                          type="number"
                          {...register('numQuestions', { valueAsNumber: true })}
                          className="w-20 text-center p-2 border border-gray-300 rounded-lg"
                          min="1"
                          max="20"
                        />
                        <button
                          type="button"
                          className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200"
                          onClick={() => setValue('numQuestions', Math.min(20, numQuestionsValue + 1), { shouldValidate: true })}
                        >
                          +
                        </button>
                        <span className="text-gray-600">(1‑20)</span>
                      </div>
                      {errors.numQuestions && (
                        <p className="mt-1 text-sm text-red-600">{errors.numQuestions.message}</p>
                      )}
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        disabled={!isValid || generateQuizMutation.isPending}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {generateQuizMutation.isPending ? 'Generating Quiz...' : 'Generate Quiz'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div>
                  {quizResult && (
                    <div className="space-y-8">
                      <div className="bg-blue-50 p-6 rounded-xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{quizResult.title}</h3>
                        <p className="text-gray-700">{quizResult.description}</p>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="bg-white p-4 rounded-lg">
                            <div className="text-sm text-blue-700">Questions</div>
                            <div className="text-2xl font-bold text-blue-800">{quizResult.totalQuestions}</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg">
                            <div className="text-sm text-green-700">Difficulty</div>
                            <div className="text-2xl font-bold text-green-800">{quizResult.difficulty}</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg">
                            <div className="text-sm text-purple-700">Time Limit</div>
                            <div className="text-2xl font-bold text-purple-800">{quizResult.timeLimit} min</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {quizResult.questions.map((question, qIndex) => (
                          <div key={question.id} className="border border-gray-200 rounded-xl p-6">
                            <h4 className="text-lg font-bold text-gray-800 mb-4">
                              {qIndex + 1}. {question.question}
                            </h4>
                            <div className="space-y-3">
                              {question.options.map((option, oIndex) => {
                                const isSelected = selectedAnswers[qIndex] === oIndex;
                                const isCorrect = oIndex === question.correctAnswer;
                                let className = "w-full p-4 text-left rounded-lg border ";
                                if (submitted) {
                                  if (isCorrect) {
                                    className += "bg-green-100 border-green-300 text-green-800";
                                  } else if (isSelected && !isCorrect) {
                                    className += "bg-red-100 border-red-300 text-red-800";
                                  } else {
                                    className += "bg-gray-50 border-gray-300 text-gray-700";
                                  }
                                } else {
                                  className += isSelected
                                    ? "bg-blue-100 border-blue-300 text-blue-800"
                                    : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100";
                                }
                                return (
                                  <button
                                    key={oIndex}
                                    type="button"
                                    className={className}
                                    onClick={() => handleAnswerSelect(qIndex, oIndex)}
                                    disabled={submitted}
                                  >
                                    <div className="flex items-center">
                                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-400'}`}>
                                        {String.fromCharCode(65 + oIndex)}
                                      </div>
                                      <span>{option}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            {submitted && (
                              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <div className="font-semibold text-gray-800">Explanation:</div>
                                <div className="text-gray-700">{question.explanation}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between pt-6 border-t border-gray-200">
                        <button
                          onClick={() => setActiveTab('generate')}
                          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                        >
                          Back to Generator
                        </button>
                        {!submitted ? (
                          <button
                            onClick={handleSubmitQuiz}
                            disabled={selectedAnswers.includes(-1)}
                            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                          >
                            Submit Quiz
                          </button>
                        ) : (
                          <button
                            onClick={handleReset}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            Generate New Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel: Info and tips */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6 sticky top-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  1
                </div>
                <span className="text-gray-700">Select a course (and optionally a specific lesson)</span>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  2
                </div>
                <span className="text-gray-700">Choose difficulty and number of questions</span>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  3
                </div>
                <span className="text-gray-700">AI generates a quiz based on the course content</span>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  4
                </div>
                <span className="text-gray-700">Take the quiz and get instant feedback with explanations</span>
              </li>
            </ul>

            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">Tips for Better Quizzes</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Select a specific lesson for more focused questions</li>
                <li>• Start with “easy” difficulty to gauge your knowledge</li>
                <li>• Use 5‑10 questions for a quick review</li>
                <li>• Read explanations even for correct answers</li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">Supported Content</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Course lectures & notes</li>
                <li>• Textbook chapters</li>
                <li>• Research papers</li>
                <li>• Documentation & articles</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
