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



// export function DreamList({ onShrink }: DreamListProps) {
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
      const response = await fetch(`http://localhost:5001/api/dreams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          position: { x: 0, y: 0 } // 初始位置
        })
      });

      if (!response.ok) throw new Error('Creation failed');
      return await response.json();
    } catch (err) {
      console.error('Failed to create a wish:', err);
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
      alert('Please input the content of your wish');
      return;
    }
    try {
      const newDream = await createDream(newDreamContent); // 使用用户输入的内容
      setDreams((prev) => [...prev, newDream]); // 将新梦想添加到列表
      setNewDreamContent(''); // 清空输入框
      setShowInput(false); // 提交后隐藏输入框
    } catch (err) {
      alert('Failed to add. Try again');
    }
  }

  //Press the enter key to add the dream 
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddDream();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setNewDreamContent('');
    }
  }

  //delete dream function
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/dreams/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('failed to delete');

      setDreams((prev) => prev.filter(dream => dream._id !== id)); // 更新状态，移除已删除的梦想
    } catch (err) {
      console.error('failed to delete the wish:', err);
    }
  }

  return (
    <div>
      <h1 className="dream-list-title">Wish List</h1>
      <div className="dream-list-content">
        {/* 显示愿望清单 */}
        {dreams.map(dream => (
          <div key={dream._id} className="dream-item">
            <span>{dream.content}</span>
            <div className="dream-actions">
              <button className="edit-button">Edit</button>
              <button className="delete-button" onClick={() => handleDelete(dream._id)}>Delete</button>
            </div>
          </div>
        ))}
        {/* 输入框与添加按钮 */}
        {showInput && (
          <div className="input-container">
            <input
              type="text"
              value={newDreamContent}
              onChange={(e) => setNewDreamContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Please input your wish"
              className="dream-input"
              autoFocus
            />
            <button
              className="canceladd-button"
              onClick={() => {
                setShowInput(false);
                setNewDreamContent('');
              }}
            >
              ✕
            </button>
          </div>
        )}
        <button className="add-button" onClick={handleAddDream}>
          {showInput ? '✓' : '+'}
        </button>
      </div>
    </div>
  );
}

export default DreamList;