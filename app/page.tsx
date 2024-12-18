'use client';

import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChapterDisplay from './components/ChapterDisplay';
import { parseChapters } from './utils/textParser';

export default function Home() {
  const [chapters, setChapters] = useState([]);

  const handleFileUpload = async (file: File) => {
    const text = await file.text();
    const parsedChapters = parseChapters(text);
    setChapters(parsedChapters);
  };

  return (
    <main className="max-w-6xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">TXT Chapter Reader</h1>
      <FileUpload onUpload={handleFileUpload} />
      <ChapterDisplay chapters={chapters} />
    </main>
  );
}
