'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const formatTime = (totalSeconds) => {
    if (totalSeconds === null) return "N/A";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} min ${String(seconds).padStart(2, '0')} sec`;
};

export default function ResultPage({ params }) {
    const { attemptId } = use(params);

    const router = useRouter();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!attemptId) return;

        const fetchResults = async () => {
            try {
                const response = await fetch(`/api/quiz/results/${attemptId}`);
                const data = await response.json();

                if (response.ok && data.success) {
                    setResults(data);
                } else {
                    alert(data.error || 'Failed to load results.');
                }
            } catch (error) {
                console.error("Fetch Results Error:", error);
                alert('Network error while fetching results.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [attemptId]);

    const handleReviewClick = () => {
        router.push(`/review/${attemptId}`);
    };

    const handleHomeClick = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-white">
                <Loader2 className="animate-spin mr-2" /> Loading Results...
            </div>
        );
    }

    if (!results) {
        return (
            <div className="text-center text-white p-10">
                <Header />
                <p>Could not load quiz results. Please check the link.</p>
                <button onClick={handleHomeClick} className="mt-4 px-6 py-2 bg-yellow-400 text-purple-900 rounded-lg font-bold hover:bg-yellow-500 transition">
                    Go to Home
                </button>
            </div>
        );
    }

    const { username, score, totalQuestions, subject, attemptedCount, correctCount, incorrectCount, timeTakenSeconds } = results;

    const performanceColor = score >= totalQuestions * 0.7 ? 'text-green-400' :
        score >= totalQuestions * 0.4 ? 'text-yellow-400' : 'text-red-400';

    return (
        <>
            <Header />
            <main className="max-w-md mx-auto p-4 md:p-8 text-white min-h-screen">
                <div className="text-center py-10 bg-purple-900/50 rounded-2xl shadow-2xl border border-purple-700">

                    <div className={`text-8xl font-extrabold ${performanceColor} mb-4`}>
                        {score}
                    </div>

                    <h1 className="text-3xl font-bold mb-2">
                        Congratulations, <span className="text-yellow-400">{username}!</span>
                    </h1>

                    <p className="text-lg text-gray-300 mb-6">
                        You got <span className='font-extrabold text-2xl text-red-400'>{score}</span> out of {totalQuestions} in the {subject} quiz.
                    </p>

                    <div className="text-md font-semibold text-gray-400 mb-8">
                        Time Taken: <span className="text-yellow-400">{formatTime(timeTakenSeconds)}</span>
                    </div>

                    <div className="flex justify-center space-x-6 mb-10 text-lg">

                        <div className="flex flex-col items-center p-3 bg-purple-800 rounded-lg">
                            <span className="text-xl font-bold text-yellow-400">{attemptedCount}</span>
                            <span className="text-sm text-gray-400">Attempted</span>
                        </div>

                        <div className="flex flex-col items-center p-3 bg-green-900/50 rounded-lg border border-green-700">
                            <span className="text-xl font-bold text-green-400 flex items-center">
                                <CheckCircle size={18} className="mr-1" /> {correctCount}
                            </span>
                            <span className="text-sm text-gray-400">Correct</span>
                        </div>

                        <div className="flex flex-col items-center p-3 bg-red-900/50 rounded-lg border border-red-700">
                            <span className="text-xl font-bold text-red-400 flex items-center">
                                <XCircle size={18} className="mr-1" /> {incorrectCount}
                            </span>
                            <span className="text-sm text-gray-400">Incorrect</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 px-8">

                        <button
                            onClick={handleReviewClick}
                            className="w-full px-6 py-3 rounded-xl font-bold text-lg bg-yellow-400 text-purple-900 hover:bg-yellow-500 transition shadow-xl"
                        >
                            See Answers & Explanations
                        </button>

                        <button
                            onClick={handleHomeClick}
                            className="w-full px-6 py-3 rounded-xl font-semibold text-white border border-purple-600 bg-purple-700 hover:bg-purple-600 transition"
                        >
                            Back to Home
                        </button>
                    </div>

                </div>
            </main>
        </>
    );
}