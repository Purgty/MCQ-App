import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/QuizEditor.css"
import Timer from './timer';

// Interfaces as provided
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
  timer?: number;
  questions: Question[];
}

// Initial empty state for a new quiz
const initialQuestion: Question = {
  category: '',
  type: '',
  difficulty: '',
  question: '',
  correct_answer: [''],
  incorrect_answers: ['']
};

const QuizEditor: React.FC = () => {
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [title, setTitle] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([initialQuestion]);
  const [error, setError] = useState<string | null>(null);  
  const [timer, setTimer] = useState<number>(0); // New state for timer
  const [nextId, setNextId] = useState<number | null>(null);
  const [existingQuizzes, setExistingQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  useEffect(() => {
    if (mode === 'edit') {
      const fetchQuizzes = async () => {
        try {
          const response = await fetch('http://localhost:3001/results');
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const quizzes: Quiz[] = await response.json();
          setExistingQuizzes(quizzes);
        } catch (error: any) {
          setError(error.message);
        }
      };
      fetchQuizzes();
    } else {
      const fetchNextId = async () => {
        try {
          const response = await fetch('http://localhost:3001/results');
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const quizzes: Quiz[] = await response.json();
          const highestId = quizzes.reduce((maxId, quiz) => Math.max(maxId, quiz.id), 0);
          setNextId(highestId + 1);
        } catch (error: any) {
          setError(error.message);
        }
      };
      fetchNextId();
    }
  }, [mode]);

  useEffect(() => {
    if (selectedQuizId !== null) {
      const fetchQuiz = async () => {
        try {
          const response = await fetch(`http://localhost:3001/results/${selectedQuizId}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const quiz: Quiz = await response.json();
          setTitle(quiz.title);
          setQuestions(quiz.questions);
        } catch (error: any) {
          setError(error.message);
        }
      };
      fetchQuiz();
    }
  }, [selectedQuizId]);

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].correct_answer = [value];
    setQuestions(updatedQuestions);
  };

  const handleIncorrectAnswerChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].incorrect_answers = value.split(',').map(answer => answer.trim());
    setQuestions(updatedQuestions);
  };

  const handleImageUpload = (index: number, file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      const updatedQuestions = [...questions];
      updatedQuestions[index].image = base64Image;
      setQuestions(updatedQuestions);
    };
    reader.readAsDataURL(file);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, initialQuestion]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const quiz: Quiz = {
      id: selectedQuizId ? selectedQuizId : (nextId as number),
      title,
      questions,
    };

    try {
      const method = selectedQuizId ? 'PUT' : 'POST'; // Use PUT for updating, POST for creating
      const response = await fetch(`http://localhost:3001/results/${selectedQuizId || ''}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quiz),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Quiz saved:', result);
      setTitle('');
      setQuestions([initialQuestion]);
      setError(null);
      window.location.href = "/editor";
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="h-full flex flex-col flex-height justify-center items-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full h-full flex-height">
        <div className="flex justify-between mb-4">
          <button
            onClick={() => setMode('add')}
            className={`px-4 py-2 rounded-md ${mode === 'add' ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            Add New Quiz
          </button>
          <button
            onClick={() => setMode('edit')}
            className={`px-4 py-2 rounded-md ${mode === 'edit' ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            Edit Existing Quiz
          </button>
        </div>

        {mode === 'edit' && !selectedQuizId ? (
          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-medium text-gray-200 mb-3">Select a Quiz to Edit</h2>
            <ul className="space-y-2">
              {existingQuizzes.map(quiz => (
                <li key={quiz.id} className="p-2 bg-gray-600 rounded-md cursor-pointer hover:bg-gray-500" onClick={() => setSelectedQuizId(quiz.id)}>
                  {quiz.title}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 h-full w-full">
            <h1 className="text-2xl font-semibold mb-4 text-gray-300">
              {selectedQuizId ? 'Edit Quiz' : 'Add a New Quiz'}
            </h1>
            <div>
              <label htmlFor="title" className="block text-lg mb-1">Title:</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
              />
            </div>
            <div>
              <label htmlFor="timer" className="block text-lg mb-1">Quiz Timer (minutes):</label>
              <input
                type="number"
                id="timer"
                value={timer}
                onChange={(e) => setTimer(Number(e.target.value))}
                required
                className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
              />
            </div>
            {questions.map((question, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg mb-4">
                <h2 className="text-xl font-medium text-gray-200 mb-3">Question {index + 1}</h2>
                <div className="space-y-2">
                  <div>
                    <label htmlFor={`category-${index}`} className="block text-sm mb-1">Category:</label>
                    <input
                      type="text"
                      id={`category-${index}`}
                      value={question.category}
                      onChange={(e) => handleQuestionChange(index, 'category', e.target.value)}
                      required
                      className="w-full p-2 rounded-md bg-gray-600 text-white border border-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={`type-${index}`} className="block text-sm mb-1">Type:</label>
                    <input
                      type="text"
                      id={`type-${index}`}
                      value={question.type}
                      onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                      required
                      className="w-full p-2 rounded-md bg-gray-600 text-white border border-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={`difficulty-${index}`} className="block text-sm mb-1">Difficulty:</label>
                    <input
                      type="text"
                      id={`difficulty-${index}`}
                      value={question.difficulty}
                      onChange={(e) => handleQuestionChange(index, 'difficulty', e.target.value)}
                      required
                      className="w-full p-2 rounded-md bg-gray-600 text-white border border-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={`question-${index}`} className="block text-sm mb-1">Question:</label>
                    <input
                      type="text"
                      id={`question-${index}`}
                      value={question.question}
                      onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                      required
                      className="w-full p-2 rounded-md bg-gray-600 text-white border border-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={`correct_answer-${index}`} className="block text-sm mb-1">Correct Answer:</label>
                    <input
                      type="text"
                      id={`correct_answer-${index}`}
                      value={question.correct_answer[0]}
                      onChange={(e) => handleCorrectAnswerChange(index, e.target.value)}
                      required
                      className="w-full p-2 rounded-md bg-gray-600 text-white border border-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={`incorrect_answers-${index}`} className="block text-sm mb-1">Incorrect Answers (comma-separated):</label>
                    <input
                      type="text"
                      id={`incorrect_answers-${index}`}
                      value={question.incorrect_answers.join(', ')}
                      onChange={(e) => handleIncorrectAnswerChange(index, e.target.value)}
                      required
                      className="w-full p-2 rounded-md bg-gray-600 text-white border border-gray-500"
                    />
                  </div>
                  <div>
                  <label htmlFor={`image-${index}`} className="block text-sm mb-1">Upload Image:</label>
                  <input
                    type="file"
                    id={`image-${index}`}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(index, e.target.files?.[0] || null)}
                    className="w-full p-2 rounded-md bg-gray-600 text-white border border-gray-500"
                  />
                  {question.image && (
                    <img
                      src={question.image}
                      alt={`Question ${index + 1} image`}
                      className="mt-2 w-full h-auto"
                    />
                  )}
                </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Add Another Question
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {selectedQuizId ? 'Update Quiz' : 'Add Quiz'}
            </button>
          </form>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default QuizEditor;
