// 愿望列表主组件 包括增加
import React, { useEffect, useRef } from 'react';
import { DreamCard } from './DreamCard';
import '../DreamList/DreamList.css';
import { useState } from 'react';

// 新增接口定义
interface Dream {
  _id: string;
  content: string;
  position: {
    x: number;
    y: number;
  };
}

export function DreamList() {
  // 状态管理梦想列表
  const [dreams, setDreams] = useState<Dream[]>([]);
  // 用户输入的愿望内容
  const [newDreamContent, setNewDreamContent] = useState<string>('');
  // 新增状态控制输入框显示
  const [showInput, setShowInput] = useState<boolean>(false);

  // 新增：创建新梦想的函数
  //can:const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/dreams`的网址写法 基于env。
  const createDream = async (content: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/dreams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          position: { x: 0, y: 0 } // 初始位置
        })
      });

      if (!response.ok) throw new Error('创建失败');
      return await response.json();
    } catch (err) {
      console.error('创建梦想失败:', err);
      throw err;
    }
  };

  // 完善 handleAddDream 函数
  const handleAddDream = async () => {

    if (!showInput) {
      // 如果输入框未显示，则显示输入框
      setShowInput(true);
      return;
    }

    // 如果已经显示输入框，则提交内容
    if (newDreamContent.trim() === '') {
      alert('请输入愿望内容');
      return;
    }
    try {
      const newDream = await createDream(newDreamContent); // 使用用户输入的内容
      setDreams((prev) => [...prev, newDream]); // 将新梦想添加到列表
      setNewDreamContent(''); // 清空输入框
      setShowInput(false); // 提交后隐藏输入框
    } catch (err) {
      alert('添加失败，请稍后重试');
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddDream();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setNewDreamContent('');
    }
  }

  return (
    <DreamCard>
      <div>
        <h1 className="dream-list-title">愿望清单</h1>
        <div className="dream-list-content">

          {/* 显示梦想列表 */}
          <div className="dream-list-content">
            {dreams.map(dream => (
              <div key={dream._id} className="dream-item">
                {dream.content}
              </div>
            ))}
          </div>

          {/* 条件渲染输入框 */}
          {showInput && (
            <input
              type="text"
              value={newDreamContent}
              onChange={(e) => setNewDreamContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入你的愿望"
              className="dream-input"
              autoFocus // 自动聚焦
            />
          )}

          <button
            className="add-button"
            onClick={handleAddDream}
          >
            {showInput ? '✓' : '+'} {/* 根据状态显示不同图标 */}
          </button>
        </div>
      </div>
    </DreamCard>
  )
}

export default DreamList;