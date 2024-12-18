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
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

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

  // 辅助函数：智能截断文本，保持单词完整
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    
    // 先截取到最大长度
    let truncated = text.slice(0, maxLength);
    
    // 如果截断点在单词中间，向前查找最近的空格
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    if (lastSpaceIndex > maxLength * 0.7) { // 确保不会截断太短
      truncated = truncated.slice(0, lastSpaceIndex);
    }
    
    return truncated + '...';
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

        // 处理标题：如果超过50个字符，智能截断并添加省略号
        const title = firstLine.length > 50 
          ? truncateText(firstLine, 50)
          : firstLine;

        return {
          title,
          content: remainingContent || firstLine // 如果没有剩余内容，使用第一行作为内容
        };
      })
      .filter((chapter): chapter is Chapter => chapter !== null);

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

  // 处理章节合并
  const handleCombineChapters = (index: number) => {
    if (index >= chapters.length - 1) return; // 如果是最后一章，不能合并

    // 保存当前状态到历史记录
    setHistory(prev => [...prev, chapters]);

    const updatedChapters = [...chapters];
    const currentChapter = updatedChapters[index];
    const nextChapter = updatedChapters[index + 1];

    // 合并内容和标题，在内容中包含下一章的标题
    const combinedChapter = {
      title: currentChapter.title,
      content: `${currentChapter.content}\n\n${nextChapter.title}\n\n${nextChapter.content}` // 添加下一章标题
    };

    // 用合并后的章节替换当前章节，并移除下一章
    updatedChapters[index] = combinedChapter;
    updatedChapters.splice(index + 1, 1);

    // 更新章节
    onChaptersUpdate(updatedChapters);
    setOpenMenuIndex(null);

    // 如果当前选中的是被合并的章节，更新选中状态
    if (selectedChapter === index + 1) {
      setSelectedChapter(index);
    }

    // 如果当前正在编辑的章节被合并，更新编辑状态
    if (editingChapter === index + 1) {
      setEditingChapter(index);
    }

    // 重置光标位置
    setCursorPosition(null);
  };

  // 处理章节删除
  const handleDeleteChapter = (index: number) => {
    // 保存当前状态到历史记录
    setHistory(prev => [...prev, chapters]);

    const updatedChapters = chapters.filter((_, i) => i !== index);
    onChaptersUpdate(updatedChapters);
    setOpenMenuIndex(null);

    // 如果删除的是当前选中的章节，选择前一章或第一章
    if (index === selectedChapter) {
      setSelectedChapter(Math.max(0, index - 1));
    }
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-120px)]">
      <div className="w-48 flex flex-col gap-2 overflow-y-auto">
        {chapters.map((chapter, index) => (
          <div 
            key={index}
            className={`flex items-start gap-2 ${
              validSelectedChapter === index ? 'bg-gray-200' : ''
            } rounded relative group`}
          >
            <button
              onClick={() => handleChapterSelect(index)}
              className="flex-1 p-2 text-left hover:bg-gray-100 rounded break-words min-w-0"
              title={chapter.title}
            >
              <div className="break-words">{chapter.title}</div>
            </button>
            {editingChapter === index && (
              <span className="shrink-0 mr-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                Editing
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuIndex(openMenuIndex === index ? null : index);
              }}
              className="shrink-0 p-1 hover:bg-gray-200 rounded-full"
            >
              <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="2" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="14" r="1.5" />
              </svg>
            </button>
            {openMenuIndex === index && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                <button
                  onClick={() => handleCombineChapters(index)}
                  disabled={index >= chapters.length - 1}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-white"
                >
                  Combine with next chapter
                </button>
                <button
                  onClick={() => handleDeleteChapter(index)}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete this chapter
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-5 border rounded-lg h-full flex flex-col overflow-hidden">
          <div className="mb-4 flex-shrink-0">
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
            <h2 className="text-xl font-bold break-words">{currentChapter.title}</h2>
          </div>
          <div
            ref={contentRef}
            contentEditable="true"
            suppressContentEditableWarning
            onInput={handleContentInput}
            onClick={handleContentClick}
            className="whitespace-pre-wrap cursor-text outline-none overflow-y-auto flex-1"
            style={{ minHeight: '200px' }}
          >
            {currentChapter.content}
          </div>
        </div>
      </div>
    </div>
  );
} 