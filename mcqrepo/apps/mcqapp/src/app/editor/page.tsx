'use client';
import React from 'react';
import QuizEditor from '../../components/QuizEditor';

const EditorPage: React.FC = () => {
  return (
    <div className="editor-container w-full">
      <QuizEditor />
    </div>
  );
};

export default EditorPage;
