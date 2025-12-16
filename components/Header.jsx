'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, History } from 'lucide-react';

export default function Header() {
  const [username, setUsername] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const checkUser = () => {
    const stored = localStorage.getItem('quiz_username');
    setUsername(stored || '');
  };

  // Load username on mount and listen for updates
  useEffect(() => {
    checkUser();
    
    // Listen for custom event from Login page or Logout action
    window.addEventListener('quiz_user_update', checkUser);
    return () => window.removeEventListener('quiz_user_update', checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('quiz_username');
    setUsername(''); 
    setIsOpen(false); 
    
    // Trigger update event for other components
    window.dispatchEvent(new Event('quiz_user_update'));
    
    router.push('/'); 
  };

  return (
    <header className="p-4 shadow-lg sticky top-0 z-50 bg-[#1e003c]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-yellow-400">
          🧠 DAILY QUIZ
        </Link>

        {/* header components */}
        <nav className="hidden md:flex items-center gap-4">
          
          {/*history*/}
          {username && (
            <Link href="/history" className="flex items-center text-white hover:text-yellow-400 transition font-medium">
               <History size={18} className="mr-2"/> History
            </Link>
          )}

          {/* Username */}
          {username && (
            <span className="px-4 py-1.5 bg-purple-700/50 border border-purple-500 rounded-full text-sm font-semibold text-white">
              Hello, {username}
            </span>
          )}

          {/*Logout Button */}
          {username && (
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-1.5 border border-red-500/50 bg-red-900/20 rounded-full text-sm font-semibold text-red-400 hover:bg-red-900/40 transition"
                title="Logout"
            >
                <LogOut size={16} />
                <span>Log out</span>
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}  
        {username && (
            <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isOpen && username && (
        <div className="md:hidden bg-purple-900 mt-2 rounded-lg p-4 shadow-xl border border-purple-700">
          <Link href="/history" className="block py-3 text-white hover:text-yellow-400 border-b border-purple-800" onClick={() => setIsOpen(false)}>
            <div className="flex items-center"><History size={18} className="mr-3"/> History</div>
          </Link>
          
          <div className="py-3 text-gray-300 text-sm font-semibold border-b border-purple-800">
            Logged in as: <span className="text-white">{username}</span>
          </div>

          <button onClick={handleLogout} className="w-full text-left py-3 text-red-400 hover:text-red-300 flex items-center">
            <LogOut size={18} className="mr-3"/> Logout
          </button>
        </div>
      )}
    </header>
  );
}