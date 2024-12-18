import React, { useState } from 'react';

function ChapterDisplay({ chapters }) {
  const [selectedChapter, setSelectedChapter] = useState(0);

  if (chapters.length === 0) {
    return null;
  }

  return (
    <div className="chapter-display">
      <div className="chapter-nav">
        {chapters.map((chapter, index) => (
          <button
            key={index}
            onClick={() => setSelectedChapter(index)}
            className={selectedChapter === index ? 'active' : ''}
          >
            {chapter.title}
          </button>
        ))}
      </div>
      <div className="chapter-content">
        <h2>{chapters[selectedChapter].title}</h2>
        <div>{chapters[selectedChapter].content}</div>
      </div>
    </div>
  );
}

export default ChapterDisplay; 