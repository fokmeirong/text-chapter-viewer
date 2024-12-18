'use client';

import { useState } from 'react';

interface Chapter {
  title: string;
  content: string;
}

interface ChapterDisplayProps {
  chapters: Chapter[];
}

export default function ChapterDisplay({ chapters = [] }: ChapterDisplayProps) {
  const [selectedChapter, setSelectedChapter] = useState(0);

  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-gray-500 text-center py-10">
        请上传TXT文件以查看章节
      </div>
    );
  }

  const currentChapter = chapters[Math.min(selectedChapter, chapters.length - 1)];

  return (
    <div className="flex gap-5">
      <div className="w-48 flex flex-col gap-2">
        {chapters.map((chapter, index) => (
          <button
            key={index}
            onClick={() => setSelectedChapter(index)}
            className={`p-2 text-left rounded hover:bg-gray-100 ${
              selectedChapter === index ? 'bg-gray-200' : ''
            }`}
          >
            {chapter.title}
          </button>
        ))}
      </div>
      <div className="flex-1 p-5 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">{currentChapter.title}</h2>
        <div className="whitespace-pre-wrap">{currentChapter.content}</div>
      </div>
    </div>
  );
} 