import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChapterDisplay from './components/ChapterDisplay';
import './App.css';

function App() {
  const [chapters, setChapters] = useState([]);

  const handleFileUpload = async (file) => {
    const text = await file.text();
    const parsedChapters = parseChapters(text);
    setChapters(parsedChapters);
  };

  return (
    <div className="App">
      <h1>TXT Chapter Reader</h1>
      <FileUpload onUpload={handleFileUpload} />
      <ChapterDisplay chapters={chapters} />
    </div>
  );
}

export default App; 