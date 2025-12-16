'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Loader2, Calendar, Clock, Trophy, Target, ChevronDown, ChevronRight, BookOpen, Home } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('quiz_username');
    if (!user) {
      router.push('/');
      return;
    }
    setUsername(user);

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/history?username=${user}`);
        const json = await res.json();

        if (json.empty) {
          setData(null);
        } else {
          setData(json);
          if (json.stats?.favoriteSubject) {
            setSelectedSubject(json.stats.favoriteSubject);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Loading state
  if (loading) return (
    <div className="min-h-screen bg-[#1e003c] flex items-center justify-center text-white">
      <Loader2 className="animate-spin mr-2" /> Loading Stats...
    </div>
  );

  // Empty state
  if (!data) return (
    <>
      <Header />
      <div className="min-h-screen bg-[#1e003c] flex flex-col items-center pt-20 text-white">
        <h2 className="text-2xl font-bold mb-4">No history found for {username}</h2>
        <p className="text-gray-400 mb-8">Play your first quiz to see stats here!</p>
        <button onClick={() => router.push('/select')} className="px-6 py-2 bg-yellow-400 text-purple-900 rounded-lg font-bold hover:bg-yellow-500">
          Play First Quiz
        </button>
      </div>
    </>
  );

  const { stats, subjectData } = data;
  const currentAttempts = selectedSubject ? subjectData[selectedSubject]?.attempts : [];
  const last7Attempts = currentAttempts ? currentAttempts.slice(0, 7).reverse() : [];

  const chartData = {
    labels: last7Attempts.map((_, index) => `Attempt ${index + 1}`),
    datasets: [
      {
        label: `${selectedSubject} Performance (%)`,
        data: last7Attempts.map(a => Math.round((a.score / a.total) * 100)),
        borderColor: 'rgb(250, 204, 21)',
        backgroundColor: 'rgba(250, 204, 21, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: 'white' } },
      title: { display: false },
    },
    scales: {
      y: { min: 0, max: 100, ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { ticks: { color: 'white' }, grid: { display: false } }
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#1e003c] p-4 md:p-8 pb-24">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-8 border-red-500 flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl">👤</div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{username}</h2>
                <p className="text-gray-500 text-xs flex items-center mt-1">
                  <Calendar size={12} className="mr-1" /> Joined: {formatDate(stats.memberSince)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-8 border-yellow-400">
              <h3 className="text-gray-500 font-semibold mb-2 text-sm uppercase tracking-wide">Overall Accuracy</h3>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-4xl font-extrabold text-gray-800">{stats.avgAccuracy}%</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800 flex items-center justify-end">
                    <Clock size={16} className="mr-1 text-gray-400" /> {formatTime(stats.avgTimeSeconds)}
                  </div>
                  <span className="text-xs text-gray-500">Avg Time</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-8 border-green-500">
              <h3 className="text-gray-500 font-semibold mb-2 text-sm uppercase tracking-wide">Best Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-600 flex items-center"><Trophy size={14} className="mr-2 text-yellow-500" /> High Score</span>
                  <span className="font-bold text-gray-800">{stats.highestScore} <span className="text-xs font-normal text-gray-500">( In: {stats.highestScoreSubject})</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center"><Target size={14} className="mr-2 text-blue-500" /> Favorite subject</span>
                  <span className="font-bold text-gray-800">{stats.favoriteSubject}</span>
                </div>
              </div>
            </div>
          </div>

          {/* history based each subject */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* subject List */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1 h-fit">
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                <BookOpen size={20} className="mr-2 text-purple-700" /> History of all Quizzes:
              </h3>
              <div className="space-y-2">
                {Object.keys(subjectData).map((subject) => (
                  <div key={subject} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setSelectedSubject(subject === selectedSubject ? null : subject)}
                      className={`w-full flex justify-between items-center p-4 transition-colors ${selectedSubject === subject ? 'bg-purple-50 text-purple-700 font-bold' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span>{subject}</span>
                      {selectedSubject === subject ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>

                    {selectedSubject === subject && (
                      <div className="bg-gray-50 p-2 max-h-60 overflow-y-auto">
                        {subjectData[subject].attempts.map((attempt, idx) => (
                          <div
                            key={attempt.id}
                            onClick={() => router.push(`/result/${attempt.id}`)}
                            className="p-3 mb-1 bg-white rounded border border-gray-100 hover:shadow-md cursor-pointer flex justify-between items-center group"
                          >
                            <div>
                              <div className="text-sm font-semibold text-gray-800 group-hover:text-purple-700">Quiz {idx + 1}</div>
                              <div className="text-xs text-gray-400">{new Date(attempt.date).toLocaleDateString()}</div>
                            </div>
                            <div className={`text-sm font-bold ${attempt.score >= attempt.total * 0.7 ? 'text-green-600' : 'text-orange-500'}`}>
                              {attempt.score}/{attempt.total}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* chart section */}
            <div className="lg:col-span-2">
              <div className="bg-[#2d0055] rounded-xl shadow-xl p-6 border border-purple-700 h-full min-h-112.5 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  📈 Trend: <span className="text-yellow-400 ml-2">{selectedSubject || 'Select Subject'}</span>
                </h3>

                <div className="flex-1 w-full bg-white/5 p-4 rounded-lg relative">
                  {selectedSubject ? (
                    <Line data={chartData} options={chartOptions} />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                      <BookOpen size={48} className="mb-4 opacity-50" />
                      <p>Select a subject on the left to view the graph.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* go back button */}
          <div className="flex justify-center pt-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold shadow-lg transition transform hover:scale-105"
            >
              <Home size={20} />
              <span>Back to home</span>
            </button>
          </div>

        </div>
      </main>
    </>
  );
}