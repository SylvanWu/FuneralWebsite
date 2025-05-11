// 愿望编辑组件(带预览)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const DreamEditor = () => {
  const { dreamId } = useParams(); // 获取路由参数中的 dreamId
  const [dream, setDream] = useState<{ content: string }>({ content: '' }); // 用于存储愿望数据

  useEffect(() => {
    const fetchDream = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/dreams/${dreamId}`);
        const data = await response.json();
        setDream(data); // 假设返回的数据中包含 content 字段
      } catch (error) {
        console.error('Failed to fetch dream:', error);
      }
    };

    fetchDream();
  }, [dreamId]);

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/dreams/${dreamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: dream.content }),
      });

      if (!response.ok) throw new Error('Failed to update the dream');

      // 更新成功后你可以选择做些操作，比如返回到清单页面
    } catch (error) {
      console.error('Error saving dream:', error);
    }
  };

  return (
    <div>
      <h1>Edit Dream</h1>
      <textarea
        value={dream.content}
        onChange={(e) => setDream({ ...dream, content: e.target.value })}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

// 默认导出 DreamEditor 组件
export default DreamEditor;