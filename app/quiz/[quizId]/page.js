'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Loader2, Check } from 'lucide-react';


const MAX_QUIZ_TIME_SECONDS = 300;

export default function QuizPage({ params }) {

  const { quizId } = use(params);

  const router = useRouter();

  const [quizStatus, setQuizStatus] = useState('loading');
  const [questions, setQuestions] = useState([]);
  const [subject, setSubject] = useState('');
  const [username, setUsername] = useState('');

  const [startTime, setStartTime] = useState(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(MAX_QUIZ_TIME_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // submit quiz
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const answersArray = Object.entries(userAnswers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption,
    }));

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          username,
          answers: answersArray,
          startedAt: startTime
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.replace(`/result/${data.attemptId}`);
      } else {
        alert(`Submission Failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Quiz Submission Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [quizId, username, userAnswers, router, isSubmitting, startTime]);

  // timer
  useEffect(() => {
    const storedUsername = localStorage.getItem('quiz_username');
    if (!storedUsername) {
      router.replace('/');
      return;
    }
    setUsername(storedUsername);

    let timer;
    if (quizStatus === 'ready') {
      timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [quizStatus, router, handleSubmit]);

  // questions fetching
  const fetchQuestions = async () => {
    setQuizStatus('loading');

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/quiz/questions/${quizId}`);
        const data = await response.json();

        if (response.status === 202 || data.quizStatus === 'generating') {
          setQuizStatus('generating');
          // If still generating, check again in 3 seconds (3000ms)
          setTimeout(checkStatus, 3000);
        }

        else if (response.ok && data.questions) {
          // SUCCESS PATH: Stop polling implicitly by not calling setTimeout
          setQuestions(data.questions);
          setSubject(data.subject);
          setQuizStatus('ready');

          if (!startTime) setStartTime(new Date());
        }

        else if (data.quizStatus === 'failed' || response.status >= 400) {
          // FAILURE PATH: Stop polling and show error
          setQuizStatus('error');
          // No setTimeout called, so the loop ends here
        }

        else {
          // Catch-all for unknown status codes, treat as error
          setQuizStatus('error');
        }
      } catch (error) {
        // Network error or server disconnect
        setQuizStatus('error');
      }
    };
    if (quizId) checkStatus();
  };

  useEffect(() => {
    if (quizId) fetchQuestions();
  }, [quizId]);

  // option selection handler
  const handleSelectOption = (questionId, selectedOption) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} mins ${String(seconds).padStart(2, '0')} sec`;
  };

  if (quizStatus === 'loading' || quizStatus === 'generating') {
    return <div className="flex h-screen items-center justify-center text-white"><Loader2 className="animate-spin mr-2" /> Loading...</div>;
  }
  if (quizStatus === 'error' || !questions.length) return <div className="text-center text-white p-10">Error loading quiz.</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto p-4 relative min-h-screen bg-[#1e003c]">

        {/* Top Bar */}
        <div className="flex justify-between items-center py-4 text-sm font-semibold sticky top-0 bg-[#1e003c] z-10">
          <div className="flex items-center space-x-2 text-yellow-400">
            <span className="p-1 rounded-full bg-purple-900">Q</span>
            <span>{currentQuestionIndex + 1} of {totalQuestions}</span>
          </div>

          <div className="relative w-auto px-4 py-2 flex items-center justify-center rounded-full bg-purple-900 border-2 border-yellow-400 shadow-lg">
            <span className="text-sm font-bold text-white">
              {formatTime(timeRemaining)}
            </span>
          </div>

          <div className="w-10"></div>
        </div>

        {/* question header */}
        <div className="text-center my-8">
          <h2 className="text-4xl font-extrabold text-white">
            Question {String(currentQuestionIndex + 1).padStart(2, '0')}
          </h2>
          <p className="text-gray-400 mt-1">{subject} Quiz</p>
        </div>

        {/* question text */}
        <div className="bg-purple-900 p-6 rounded-xl shadow-xl mb-8 border border-purple-800">
          <p className="text-lg text-white leading-relaxed">
            {currentQuestion.text}
          </p>
        </div>

        {/* options */}
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = userAnswers[currentQuestion._id] === option;
            return (
              <button
                key={option}
                onClick={() => handleSelectOption(currentQuestion._id, option)}
                disabled={isSubmitting}
                className={`
                            w-full text-left p-4 rounded-xl border-2 transition duration-200 
                            flex justify-between items-center group
                            ${isSelected
                    ? 'bg-purple-800 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                    : 'bg-purple-900 border-purple-700 hover:bg-purple-800 hover:border-purple-500'}
                        `}
              >
                <span className="flex-1 text-white group-hover:text-yellow-100 transition">{option}</span>

                <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center border transition-all
                            ${isSelected ? 'bg-yellow-400 border-yellow-400' : 'border-gray-500'}
                        `}>
                  {isSelected && <Check size={16} className="text-purple-900 font-bold" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-linear-to-t from-[#1e003c] via-[#1e003c] to-transparent pt-10">
          <div className="max-w-md mx-auto flex gap-4">

            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-600 transition"
            >
              Previous
            </button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition shadow-lg"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 transition shadow-lg flex justify-center items-center"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit'}
              </button>
            )}
          </div>
        </div>

      </main>
    </>
  );
}