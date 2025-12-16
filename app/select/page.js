'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Loader2 } from 'lucide-react';

//list of UPSC subjects
const UPSC_SUBJECTS = [
  "History", "Geography", "Indian Politics", "Indian Economy",
  "Science & Technology", "Environment & Ecology", "Ethics & Integrity",
  "Social Justice", "International Relations", "Current Affairs"
];

export default function SubjectSelectPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loadingTopic, setLoadingTopic] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('quiz_username');
    if (!storedUsername) {
      router.replace('/');
    }
    setUsername(storedUsername);
  }, [router]);

  const handleSubjectClick = async (topic) => {
    if (loadingTopic) return;

    setLoadingTopic(topic);
    let success = false;

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, username }),
      });

      const data = await response.json();

      if (data.success && data.quizId) {
        router.push(`/quiz/${data.quizId}`);
      } else {
        alert(`Failed to start quiz: ${data.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Generation API error:', error);
      alert('Network error or server failed to initiate quiz.');
    } finally {
      if (!success) {
        setLoadingTopic(null);
      }
    }
  };

  if (!username) return null;

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-yellow-400">
          Hello, {username}! Choose your UPSC Subject:
        </h1>

        {loadingTopic && (
          <div className="flex items-center justify-center p-4 mb-6 bg-purple-900/50 rounded-lg">
            <Loader2 className="animate-spin mr-3 text-yellow-400" size={24} />
            <p className="text-lg">Generating 10 questions for **{loadingTopic}**... Please wait a moment.</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {UPSC_SUBJECTS.map((topic) => (
            <button
              key={topic}
              onClick={() => handleSubjectClick(topic)}
              disabled={!!loadingTopic}
              className={`
                p-6 rounded-xl text-left transition transform hover:scale-[1.02] 
                shadow-lg border-2 
                ${loadingTopic === topic ? 'bg-purple-900 border-yellow-400' : 'bg-purple-800 border-purple-700 hover:border-yellow-400'}
                ${loadingTopic && loadingTopic !== topic ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <h2 className="text-xl font-semibold">{topic}</h2>
              {loadingTopic === topic && (
                <div className="mt-2 text-yellow-400 flex items-center">
                  <Loader2 className="animate-spin mr-2" size={16} /> Generating...
                </div>
              )}
            </button>
          ))}
        </div>
      </main>
    </>
  );
}