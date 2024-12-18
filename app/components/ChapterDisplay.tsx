'use client';

import { useState, useRef } from 'react';
import { Chapter } from '../types';

interface ChapterDisplayProps {
  chapters: Chapter[];
  onChaptersUpdate: (chapters: Chapter[]) => void;
}

export default function ChapterDisplay({ chapters = [], onChaptersUpdate }: ChapterDisplayProps) {
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [history, setHistory] = useState<Chapter[][]>([]);
  const [editingChapter, setEditingChapter] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-gray-500 text-center py-10">
        请上传TXT文件以查看章节
      </div>
    );
  }

  const validSelectedChapter = Math.min(selectedChapter, chapters.length - 1);
  const currentChapter = chapters[validSelectedChapter];

  // 检查当前章节是否包含分隔符
  const hasSplitMarkers = currentChapter?.content.includes('==== split chapter ====');

  // 处理点击事件和光标位置
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!contentRef.current) return;

    // 确保元素获得焦点
    contentRef.current.focus();

    // 获取点击位置的光标位置
    const selection = window.getSelection();
    const range = document.caretRangeFromPoint(e.clientX, e.clientY);
    
    if (selection && range) {
      // 清除现有选择
      selection.removeAllRanges();
      // 设置新的光标位置
      selection.addRange(range);
      
      // 保存光标位置
      setCursorPosition(range.startOffset);
    }
  };

  // 防止内容被编辑
  const handleContentInput = (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (contentRef.current) {
      contentRef.current.textContent = currentChapter.content;
    }
  };

  // 修改章节选择处理函数
  const handleChapterSelect = (index: number) => {
    setSelectedChapter(index);
    setEditingChapter(null); // 切换章节时清除编辑状态
  };

  // 插入章节分隔符
  const insertChapterSplit = () => {
    if (cursorPosition === null || !contentRef.current) {
      alert('请先点击要插入分隔符的位置');
      return;
    }

    // 设置当前正在编辑的章节
    setEditingChapter(selectedChapter);

    // 保存当前状态到历史记录
    setHistory(prev => [...prev, chapters]);

    const content = currentChapter.content;
    const newContent = 
      content.slice(0, cursorPosition) + 
      '\n\n==== split chapter ====\n\n' +
      content.slice(cursorPosition);

    const updatedChapters = [...chapters];
    updatedChapters[selectedChapter] = {
      ...currentChapter,
      content: newContent
    };

    onChaptersUpdate(updatedChapters);
    setCursorPosition(null);
  };

  // 修改撤销功能
  const handleUndo = () => {
    if (history.length === 0) return;
    
    const previousState = history[history.length - 1];
    onChaptersUpdate(previousState);
    setHistory(prev => prev.slice(0, -1));
    setCursorPosition(null);
  };

  // 执行章节分割
  const handleSplit = () => {
    if (!hasSplitMarkers) return;

    // 分割当前章节内容
    const parts = currentChapter.content.split('==== split chapter ====');
    
    // 创建新的章节数组，并过滤掉空内容的章节
    const newChapters = parts
      .map((content, index) => {
        const trimmedContent = content.trim();
        
        // 跳过空内容
        if (!trimmedContent) return null;

        // 第一部分保持原有标题和内容
        if (index === 0) {
          return {
            title: currentChapter.title,
            content: trimmedContent
          };
        }

        // 后续部分使用内容的第一行作为标题
        const lines = trimmedContent.split('\n');
        const firstLine = lines[0].trim();
        const remainingContent = lines.slice(1).join('\n').trim();

        // 处理标题：如果超过30个字符，截断并添加省略号
        const title = firstLine.length > 30 
          ? firstLine.slice(0, 30) + '...'
          : firstLine;

        return {
          title,
          content: remainingContent || firstLine // 如果没有剩余内容，使用第一行作为内容
        };
      })
      .filter((chapter): chapter is Chapter => chapter !== null); // 过滤掉空章节

    // 更新章节列表
    const updatedChapters = [
      ...chapters.slice(0, selectedChapter),
      ...newChapters,
      ...chapters.slice(selectedChapter + 1)
    ];

    // 保存当前状态到历史记录
    setHistory(prev => [...prev, chapters]);
    
    // 更新章节
    onChaptersUpdate(updatedChapters);
    
    // 清除编辑状态
    setEditingChapter(null);
    setCursorPosition(null);
  };

  return (
    <div className="flex gap-5">
      <div className="w-48 flex flex-col gap-2">
        {chapters.map((chapter, index) => (
          <div 
            key={index}
            className={`flex items-center gap-2 ${
              validSelectedChapter === index ? 'bg-gray-200' : ''
            } rounded`}
          >
            <button
              onClick={() => handleChapterSelect(index)}
              className="flex-1 p-2 text-left hover:bg-gray-100 rounded"
            >
              {chapter.title}
            </button>
            {editingChapter === index && (
              <span className="mr-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                Editing
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex-1">
        <div className="p-5 border rounded-lg">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded">
              <button
                onClick={insertChapterSplit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 text-sm"
                disabled={cursorPosition === null}
              >
                Insert chapter split
              </button>
              <button
                onClick={handleSplit}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 text-sm"
                disabled={!hasSplitMarkers}
              >
                Split
              </button>
              <button
                onClick={handleUndo}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 text-sm"
                disabled={history.length === 0}
              >
                Undo
              </button>
              {cursorPosition !== null && (
                <span className="text-sm text-gray-500">
                  光标位置: {cursorPosition}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold">{currentChapter.title}</h2>
          </div>
          <div
            ref={contentRef}
            contentEditable="true"
            suppressContentEditableWarning
            onInput={handleContentInput}
            onClick={handleContentClick}
            className="whitespace-pre-wrap cursor-text outline-none"
            style={{ minHeight: '200px' }}
          >
            {currentChapter.content}
          </div>
        </div>
      </div>
    </div>
  );
} 