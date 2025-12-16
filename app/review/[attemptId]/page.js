'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function ReviewPage({ params }) {
    const { attemptId } = use(params);
    
    const router = useRouter();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        if (!attemptId) return;

        const fetchResults = async () => {
            try {
                //reuse the detailed results API endpoint
                const response = await fetch(`/api/quiz/results/${attemptId}`);
                const data = await response.json();

                if (response.ok && data.success) {
                    setResults(data);
                } else {
                    alert(data.error || 'Failed to load review details.');
                }
            } catch (error) {
                console.error("Fetch Review Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [attemptId]);

    const handleHomeClick = () => router.push('/');

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-white">
                <Loader2 className="animate-spin mr-2" /> Loading Review...
            </div>
        );
    }

    if (!results || !results.reviewDetails || results.reviewDetails.length === 0) {
        return (
            <div className="text-center text-white p-10">
                <Header />
                <p>No review data found for this attempt.</p>
                <button onClick={handleHomeClick} className="mt-4 px-6 py-2 bg-yellow-400 text-purple-900 rounded-lg font-bold hover:bg-yellow-500 transition">
                    Go to Home
                </button>
            </div>
        );
    }
    
    const currentReview = results.reviewDetails[currentQuestionIndex];
    const totalQuestions = results.reviewDetails.length;
    
    return (
        <>
            <Header />
            <main className="max-w-xl mx-auto p-4 text-white min-h-screen">
                <h1 className="text-3xl font-bold mb-4 text-yellow-400">
                    Review: {results.subject} Quiz
                </h1>
                
                {/* status Bar */}
                <div className={`p-3 rounded-xl mb-6 flex justify-between items-center ${currentReview.isCorrect ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
                    <span className="text-lg font-semibold">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <span className={`flex items-center font-bold ${currentReview.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {currentReview.isCorrect ? (
                            <><CheckCircle size={20} className="mr-2"/> Your Answer: Correct</>
                        ) : (
                            <><XCircle size={20} className="mr-2"/> Your Answer: Incorrect</>
                        )}
                    </span>
                </div>

                {/* question Text */}
                <div className="bg-purple-900 p-6 rounded-xl shadow-xl mb-6 border border-purple-800">
                    <p className="text-lg leading-relaxed">
                        {currentReview.text}
                    </p>
                </div>

                {/* Options Review */}
                <div className="space-y-3 mb-6">
                    {currentReview.options.map((option, index) => {
                        const isSelected = option === currentReview.selectedOption;
                        const isCorrect = option === currentReview.correctOption;
                        
                        let optionClass = 'bg-purple-800 border-purple-700';

                        if (isCorrect) {
                            optionClass = 'bg-green-900/30 border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]'; //correct answer 
                        }
                        if (isSelected && !isCorrect) {
                            optionClass = 'bg-red-900/30 border-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]'; 
                        }
                        
                        return (
                            <div
                                key={index}
                                className={`
                                    w-full text-left p-4 rounded-xl border-2 transition duration-200 
                                    flex flex-col ${optionClass}
                                `}
                            >
                                <span className="font-medium text-white">{option}</span>
                                {isCorrect && <span className="text-xs text-green-300 mt-1 font-semibold">Correct Answer</span>}
                                {isSelected && !isCorrect && <span className="text-xs text-red-300 mt-1 font-semibold">Your Incorrect Choice</span>}
                            </div>
                        );
                    })}
                </div>
                
                {/* explanation Box */}
                <div className="bg-yellow-400/10 p-5 rounded-xl border border-yellow-400 mb-8">
                    <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center">
                        <span className="mr-2">💡</span> AI Explanation
                    </h3>
                    <p className="text-gray-200">
                        {currentReview.explanation}
                    </p>
                </div>

                {/* navigation and Home Button */}
                <div className="flex justify-between items-center gap-4 pb-10">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 rounded-lg font-bold text-white bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-600 transition"
                    >
                        &larr; Previous
                    </button>
                    
                    {currentQuestionIndex < totalQuestions - 1 ? (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="px-4 py-2 rounded-lg font-bold text-white bg-orange-600 hover:bg-orange-700 transition"
                        >
                            Next &rarr;
                        </button>
                    ) : (
                         <button
                            onClick={handleHomeClick}
                            className="px-4 py-2 rounded-lg font-bold text-purple-900 bg-yellow-400 hover:bg-yellow-500 transition"
                        >
                            Finish & Go Home
                        </button>
                    )}
                </div>
            </main>
        </>
    );
}