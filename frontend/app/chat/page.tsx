'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import axios from 'axios';

// Define chat schema inline to avoid import issues
const chatSchema = z.object({
  message: z.string().min(1, { message: 'Message cannot be empty' }).max(50000, { message: 'Message exceeds maximum length' }),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
});

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI learning assistant. Ask me any doubts about your courses, lessons, or concepts.',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [courseId, setCourseId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch available courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await axios.get('/api/courses');
      return response.data;
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await axios.post('/api/ai/chat', {
        message,
        courseId: courseId || undefined,
        lessonId: lessonId || undefined,
        history: messages.slice(-5).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      });
      return response.data;
    },
    onSuccess: (data) => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    },
  });

  // Form handling with validation
  const { register, handleSubmit, formState: { errors } } = useForm<{ message: string }>({
    resolver: zodResolver(chatSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: { message: string }) => {
    if (!data.message.trim()) return;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: data.message,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    sendMessageMutation.mutate(data.message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Doubt Chat</h1>
      <p className="text-gray-600 mb-8">
        Get instant answers to your learning questions. The AI understands your course context.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left panel: Context settings */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6 sticky top-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Chat Context</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course (Optional)
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  disabled={coursesLoading}
                >
                  <option value="">-- No specific course --</option>
                  {courses?.map((course: any) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Selecting a course helps AI provide more relevant answers.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson (Optional)
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter lesson ID or title"
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Example Questions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setInput('Explain the concept of closures in JavaScript.')}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700"
                  >
                    Explain the concept of closures in JavaScript.
                  </button>
                  <button
                    onClick={() => setInput('What is the difference between REST and GraphQL?')}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700"
                  >
                    What is the difference between REST and GraphQL?
                  </button>
                  <button
                    onClick={() => setInput('How does React virtual DOM work?')}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700"
                  >
                    How does React virtual DOM work?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: Chat interface */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="bg-white rounded-xl shadow flex-grow flex flex-col">
            {/* Chat header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">AI Learning Assistant</h3>
                  <p className="text-sm text-gray-600">Powered by Gemini AI</p>
                </div>
                <div className="ml-auto">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Messages container */}
            <div className="flex-grow p-6 overflow-y-auto max-h-[500px]">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none p-4">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input area */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex space-x-4">
                <div className="flex-grow">
                  <textarea
                    {...register('message')}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Type your doubt here... (Press Enter to send, Shift+Enter for new line)"
                    rows={3}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={sendMessageMutation.isPending || isTyping}
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={!input.trim() || sendMessageMutation.isPending || isTyping}
                    className="bg-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendMessageMutation.isPending || isTyping ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <div>
                  {courseId ? 'Chatting with course context' : 'General chat mode'}
                </div>
                <div>
                  {messages.length - 1} messages exchanged
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}