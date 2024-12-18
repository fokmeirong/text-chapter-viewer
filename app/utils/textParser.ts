interface Chapter {
  title: string;
  content: string;
}

// 英文数字映射
const englishNumbers = [
  'zero', 'one', 'two', 'three', 'four', 'five', 
  'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'
];

export function parseChapters(text: string): Chapter[] {
  // 支持更多章节标题格式
  const chapterPatterns = [
    // 阿拉伯数字章节 - 第1章、第01章、第100章
    /第[0-9]{1,4}章[^\n]*/,
    // 中文数字章节 - 第一章、第十一章、第一百章
    /第[一二三四五六七八九十百千万]+章[^\n]*/,
    // 英文章节 - Chapter 1、Chapter 01
    /Chapter\s*[0-9]{1,4}[^\n]*/i,
    // 英文章节带英文数字 - Chapter One、Chapter Twenty
    new RegExp(`Chapter\\s+(${englishNumbers.join('|')})[^\n]*`, 'i'),
    // 简单数字章节 - 1、1.、1:
    /^\s*\d+[\.:：](?=[^\n]*)/m
  ];

  // 调试日志
  console.log('Processing text:', text.slice(0, 200) + '...');
  
  // 检查是否使用 CHAPTER END 作为分隔符
  if (text.includes('---CHAPTER END---')) {
    return parseChaptersWithEnd(text);
  }

  // 使用常规模式
  let pattern = null;
  for (const p of chapterPatterns) {
    if (text.match(p)) {
      pattern = p;
      console.log('Matched pattern:', p);
      break;
    }
  }

  if (!pattern) {
    console.log('No chapter pattern matched');
    const lines = text.trim().split('\n');
    const firstLine = lines[0]?.trim();

    if (!firstLine) {
      return [{
        title: '全文',
        content: text
      }];
    }

    return [{
      title: firstLine,
      content: lines.slice(1).join('\n').trim() || firstLine
    }];
  }

  const chapters: Chapter[] = [];
  const lines = text.split('\n');
  let currentChapter: Chapter = {
    title: '',
    content: ''
  };

  for (let line of lines) {
    if (pattern.test(line.trim())) {
      if (currentChapter.title) {
        chapters.push({
          title: currentChapter.title,
          content: currentChapter.content.trim()
        });
      }
      currentChapter = {
        title: line.trim(),
        content: ''
      };
    } else if (currentChapter.title) {
      currentChapter.content += line + '\n';
    } else {
      currentChapter = {
        title: '序言',
        content: (currentChapter.content || '') + line + '\n'
      };
    }
  }

  if (currentChapter.title) {
    chapters.push({
      title: currentChapter.title,
      content: currentChapter.content.trim()
    });
  }

  return chapters.length > 0 ? chapters : [{
    title: '全文',
    content: text
  }];
}

// 处理带有 CHAPTER END 标记的文本
function parseChaptersWithEnd(text: string): Chapter[] {
  const chapters: Chapter[] = [];
  const chapterBlocks = text.split('---CHAPTER END---');
  
  // 英文章节标题的正则表达式
  const chapterTitlePattern = new RegExp(
    `Chapter\\s+(${englishNumbers.join('|')}|\\d+)[^\n]*`,
    'i'
  );

  chapterBlocks.forEach((block) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return;

    const lines = trimmedBlock.split('\n');
    const firstLine = lines[0].trim();
    
    if (chapterTitlePattern.test(firstLine)) {
      chapters.push({
        title: firstLine,
        content: lines.slice(1).join('\n').trim()
      });
    } else {
      // 如果第一行不是章节标题，将整个块作为一个章节
      chapters.push({
        title: '未命名章节',
        content: trimmedBlock
      });
    }
  });

  console.log('Found chapters with END marks:', chapters.length);
  return chapters.length > 0 ? chapters : (() => {
    const lines = text.trim().split('\n');
    const firstLine = lines[0]?.trim();

    if (!firstLine) {
      return [{
        title: '全文',
        content: text
      }];
    }

    return [{
      title: firstLine,
      content: lines.slice(1).join('\n').trim() || firstLine
    }];
  })();
} 