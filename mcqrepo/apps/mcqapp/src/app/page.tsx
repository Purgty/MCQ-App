'use client';
import '../styles/globals.css';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Home: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Apply the theme to the body
    document.body.className = isDarkMode ? 'dark-mode' : 'light-mode';
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <div className={`flex h-screen w-screen ${isDarkMode ? 'bg-[#121212]' : 'bg-[#ffffff]'}`}>
      {/* Left Half for Welcome Message */}
      <div className={`flex flex-col items-center justify-center w-1/2 ${isDarkMode ? 'bg-[#18181b]' : 'bg-[#e4e4e7]'}`}>
        <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Welcome to the Quiz App
        </h1>
      </div>

      {/* Right Half for Buttons */}
      <div className={`flex flex-col items-center justify-center w-1/2`}>
        <div className="space-y-4">
          <Link href="/learner">
            <button className="block w-64 px-4 py-2 text-center rounded-lg shadow-lg bg-[#6200ea]">
              Student Mode
            </button>
          </Link>
          <br />
          <br />
          <Link href="/editor">
            <button className="block w-64 px-4 py-2 text-center rounded-lg shadow-lg">
              Editor Mode
            </button>
          </Link>
        </div>
      </div>
      <button
        onClick={toggleTheme}
        className={`bg-[#6200ea] absolute top-4 right-4 text-white rounded-lg shadow-lg transition-all`}
      >
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
};

export default Home;
