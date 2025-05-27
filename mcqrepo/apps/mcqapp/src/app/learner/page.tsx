'use client';// pages/index.tsx''
import Head from 'next/head';
import Quiz from '../../components/Quiz';
import '../../styles/Quiz.css';
import Link from 'next/link';
const Home: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Top 10% for the back button */}
      <div className="flex-none h-[10%]">
        <Link href="/">
          <button className="absolute top-4 left-4 bg-blue-500 m-4 w-64 px-4 py-2 text-center rounded-lg shadow-lg text-left">
            Back
          </button>
        </Link>
      </div>
  
      {/* Remaining 90% for the quiz content */}
      <div className="flex-grow h-[90%]">
        <Quiz />
      </div>
    </div>
  );
  
};

export default Home;
