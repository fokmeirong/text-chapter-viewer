export function parseChapters(text) {
  // 匹配常见的章节标题格式
  const chapterPattern = /第[一二三四五六七八九十百千万\d]+章[\s\S]*?(?=第[一二三四五六七八九十百千万\d]+章|$)/g;
  
  // 提取章节标题的正则
  const titlePattern = /第[一二三四五六七八九十百千万\d]+章[^\n]*/;
  
  const matches = text.match(chapterPattern);
  
  if (!matches) {
    return [{
      title: '全文',
      content: text
    }];
  }

  return matches.map(chapter => {
    const titleMatch = chapter.match(titlePattern);
    const title = titleMatch ? titleMatch[0].trim() : '未命名章节';
    const content = chapter.replace(titlePattern, '').trim();
    
    return {
      title,
      content
    };
  });
} 