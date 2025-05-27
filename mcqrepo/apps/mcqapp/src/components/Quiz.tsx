'use client';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Timer from "../components/timer";
import '../styles/Quiz.css';
import he from 'he';

interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string[];
  incorrect_answers: string[];
  image?: string;  
}

interface Quiz {
  id: number;
  title: string;
  questions: Question[];
  timer?: number; // Optional timer field (in seconds)
}

const Quiz: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('http://localhost:3001/results');
        setQuizzes(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
      if (selectedQuiz.timer) {
        setTimeLeft(selectedQuiz.timer);
        timerRef.current = setInterval(() => {
          setTimeLeft((prevTime) => {
            if (prevTime === null || prevTime <= 0) {
              clearInterval(timerRef.current!);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [selectedQuiz, currentQuestionIndex]);

  const handleQuizSelect = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  const handleAnswer = (answer: string) => {
    if (selectedQuiz && selectedQuiz.questions[currentQuestionIndex].correct_answer.includes(answer)) {
      setScore(score + 1);
    }
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!selectedQuiz) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        <h1 className="col-span-2 text-center text-2xl mb-4">Select a Quiz</h1>
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-[#1e293b] rounded-lg shadow-lg p-4 flex flex-col justify-between">
            <h2 className="text-xl font-bold">{quiz.title}</h2>
            <p className="mt-2">Questions: {quiz.questions.length}</p>
            <p>Total Marks: {quiz.questions.length}</p>
            <p>Time Limit: {Math.floor((quiz.timer ?? 0) / 60)}:{((quiz.timer ?? 0) % 60).toString().padStart(2, '0')}</p>

            <button
              className="mt-4 bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600"
              onClick={() => handleQuizSelect(quiz)}
            >
              Start Quiz
            </button>
          </div>
        ))}
      </div>
    );
  }

  if (currentQuestionIndex >= selectedQuiz.questions.length) {
    return (
      <div>
        <h2>Your score: {score} out of {selectedQuiz.questions.length}</h2>
        <button onClick={() => setSelectedQuiz(null)}>Back to Quiz Selection</button>
      </div>
    );
  }

  const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
  const allAnswers = [...currentQuestion.correct_answer, ...currentQuestion.incorrect_answers];
  const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);
  let initialSec: number;

  // Check if selectedQuiz.timer is a number or can be converted to a number
  if (typeof selectedQuiz.timer === 'number') {
      initialSec = selectedQuiz.timer; // Safe assignment
  } else if (typeof selectedQuiz.timer === 'string' && !isNaN(Number(selectedQuiz.timer))) {
      initialSec = Number(selectedQuiz.timer); // Convert string to number
  } else {
      initialSec = 0; // Default value if timer is not a number or doesn't exist
  }
  const handleTimeUp = () => {
    setIsQuizActive(false); // End the quiz when time is up
  };
  return (
    <div className="quiz-container">
      <div className="absolute top-4 right-4">
        <Timer initialSeconds={initialSec} onTimeUp={handleTimeUp}/>
      </div>
      <div className="quiz-content flex h-screen">
        <div className="quiz-question">
          <h1>Question No.: {currentQuestionIndex + 1}</h1>
          <h2>{he.decode(currentQuestion.question)}</h2>
          <div className="answers">
            {shuffledAnswers.map((answer, index) => (
              <button key={index} onClick={() => handleAnswer(answer)}>
                {he.decode(answer)}
              </button>
            ))}
          </div>
        </div>
        {currentQuestion.image && (
          <div className="quiz-image">
            <img src={currentQuestion.image} alt="Question" className='w-48 h-48 object-contain absolute right-4'/>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
