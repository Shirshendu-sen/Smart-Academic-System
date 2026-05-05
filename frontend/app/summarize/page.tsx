'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import axios from 'axios';

// Define summarize schema inline to avoid import issues
const summarizeSchema = z.object({
  content: z.string().min(1, { message: 'Content cannot be empty' }).max(50000, { message: 'Content exceeds maximum length' }),
  length: z.enum(['short', 'medium', 'detailed'], { required_error: 'Select summary length' }),
});

interface SummaryResult {
  originalLength: number;
  summaryLength: number;
  summary: string;
  keyPoints: string[];
  readingTimeSaved: string;
}

type SummarizeFormData = {
  content: string;
  length: 'short' | 'medium' | 'detailed';
  courseId?: string;
  lessonId?: string;
};

export default function SummarizePage() {
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'result'>('input');
  const [courseId, setCourseId] = useState('');
  const [lessonId, setLessonId] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
  } = useForm<SummarizeFormData>({
    resolver: zodResolver(summarizeSchema),
    mode: 'onChange',
    defaultValues: {
      content: '',
      length: 'medium',
    },
  });

  const contentValue = watch('content');
  const lengthValue = watch('length');

  // Example texts for quick start
  const exampleTexts = [
    {
      title: 'React Hooks',
      content: `React Hooks are functions that let you use state and other React features without writing a class. The most common hooks are useState, useEffect, and useContext. useState allows you to add state to functional components. useEffect lets you perform side effects in function components, replacing lifecycle methods like componentDidMount and componentDidUpdate. useContext provides a way to pass data through the component tree without having to pass props down manually at every level. Custom Hooks let you extract component logic into reusable functions. Rules of Hooks: only call hooks at the top level, don't call hooks inside loops, conditions, or nested functions.`
    },
    {
      title: 'REST API Principles',
      content: `REST (Representational State Transfer) is an architectural style for designing networked applications. It relies on a stateless, client-server, cacheable communications protocol. RESTful systems typically use HTTP methods: GET to retrieve resources, POST to create new resources, PUT to update existing resources, DELETE to remove resources. Resources are identified by URIs. REST APIs should be stateless, meaning each request contains all the information needed to process it. Responses should be cacheable when possible. REST APIs use standard HTTP status codes: 200 for success, 201 for created, 400 for bad request, 401 for unauthorized, 404 for not found, 500 for server error.`
    },
    {
      title: 'Machine Learning Basics',
      content: `Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. There are three main types: supervised learning (labeled data), unsupervised learning (unlabeled data), and reinforcement learning (reward-based). Common algorithms include linear regression, logistic regression, decision trees, random forests, support vector machines, and neural networks. The machine learning workflow involves data collection, data preprocessing, model selection, training, evaluation, and deployment. Key concepts include overfitting (model performs well on training data but poorly on new data) and underfitting (model fails to capture underlying patterns).`
    }
  ];

  // Generate summary mutation
  const generateSummaryMutation = useMutation({
    mutationFn: async (data: SummarizeFormData) => {
      const response = await axios.post('/api/ai/summarize', {
        text: data.content,
        courseId: courseId || undefined,
        lessonId: lessonId || undefined,
        length: data.length,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSummaryResult(data);
      setActiveTab('result');
      toast.success('Summary generated successfully!');
    },
    onError: (error: any) => {
      console.error('Summarization error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate summary');
    },
  });

  const handleExampleClick = (content: string) => {
    setValue('content', content, { shouldValidate: true });
  };

  const handleReset = () => {
    reset();
    setSummaryResult(null);
    setActiveTab('input');
    setCourseId('');
    setLessonId('');
  };

  const wordCount = contentValue.trim().split(/\s+/).filter(word => word.length > 0).length;

  const onSubmit = (data: SummarizeFormData) => {
    if (!data.content.trim()) return;
    generateSummaryMutation.mutate(data);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Content Summarizer</h1>
      <p className="text-gray-600 mb-8">
        Generate concise summaries of course materials, articles, or any text content using AI.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left panel: Input and configuration */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  className={`px-6 py-4 font-medium text-lg ${activeTab === 'input' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('input')}
                >
                  Input Text
                </button>
                <button
                  className={`px-6 py-4 font-medium text-lg ${activeTab === 'result' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('result')}
                  disabled={!summaryResult}
                >
                  Summary Result
                </button>
              </div>
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === 'input' ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paste your text below
                    </label>
                    <textarea
                      {...register('content')}
                      className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Paste your course material, article, or any text you want to summarize..."
                    />
                    {errors.content && (
                      <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                    )}
                    <div className="flex justify-between mt-2 text-sm text-gray-500">
                      <div>{wordCount} words</div>
                      <div>{contentValue.length} characters</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Summary Length
                    </label>
                    <div className="flex space-x-4">
                      {['short', 'medium', 'detailed'].map((length) => (
                        <button
                          key={length}
                          type="button"
                          className={`px-4 py-2 rounded-lg ${lengthValue === length ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                          onClick={() => setValue('length', length as any, { shouldValidate: true })}
                        >
                          {length.charAt(0).toUpperCase() + length.slice(1)}
                        </button>
                      ))}
                    </div>
                    {errors.length && (
                      <p className="mt-1 text-sm text-red-600">{errors.length.message}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      {lengthValue === 'short' && 'Very concise (10-20% of original)'}
                      {lengthValue === 'medium' && 'Balanced (20-30% of original)'}
                      {lengthValue === 'detailed' && 'Comprehensive (30-50% of original)'}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Clear Text
                    </button>
                    <button
                      type="submit"
                      disabled={!isValid || generateSummaryMutation.isPending}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {generateSummaryMutation.isPending ? 'Generating Summary...' : 'Generate Summary'}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  {summaryResult && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-blue-700">Original</div>
                          <div className="text-2xl font-bold text-blue-800">{summaryResult.originalLength} words</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-sm text-green-700">Summary</div>
                          <div className="text-2xl font-bold text-green-800">{summaryResult.summaryLength} words</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-sm text-purple-700">Reduction</div>
                          <div className="text-2xl font-bold text-purple-800">
                            {Math.round((1 - summaryResult.summaryLength / summaryResult.originalLength) * 100)}%
                          </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="text-sm text-orange-700">Time Saved</div>
                          <div className="text-2xl font-bold text-orange-800">{summaryResult.readingTimeSaved}</div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Summary</h3>
                        <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap">
                          {summaryResult.summary}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Key Points</h3>
                        <ul className="space-y-2">
                          {summaryResult.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                                {index + 1}
                              </div>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-6 border-t border-gray-200">
                        <button
                          onClick={() => setActiveTab('input')}
                          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                        >
                          Back to Input
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel: Examples and info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6 sticky top-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Examples</h2>
            <p className="text-gray-600 mb-6">
              Try these example texts to see how the summarizer works:
            </p>

            <div className="space-y-4 mb-8">
              {exampleTexts.map((example, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition"
                  onClick={() => handleExampleClick(example.content)}
                >
                  <h4 className="font-bold text-gray-800 mb-1">{example.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {example.content.substring(0, 120)}...
                  </p>
                  <div className="text-xs text-blue-600 mt-2">Click to load</div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-bold text-gray-800 mb-3">How It Works</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    1
                  </div>
                  <span className="text-sm text-gray-700">Paste your text or load an example</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    2
                  </div>
                  <span className="text-sm text-gray-700">Choose summary length (short/medium/detailed)</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    3
                  </div>
                  <span className="text-sm text-gray-700">AI extracts key information and generates concise summary</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    4
                  </div>
                  <span className="text-sm text-gray-700">Review summary and key points for quick understanding</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">Best For</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Course lecture notes</li>
                <li>• Research papers</li>
                <li>• Long articles & blog posts</li>
                <li>• Meeting transcripts</li>
                <li>• Documentation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}