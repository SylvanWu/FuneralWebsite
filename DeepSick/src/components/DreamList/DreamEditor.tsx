// 愿望编辑组件(带预览)
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import RichTextEditor from './RichTextEditor';

interface Dream {
  _id: string;
  content: string;
}

const DreamEditor = () => {
  const location = useLocation();
  const { dreams }: { dreams: Dream[] } = location.state || { dreams: [] };
  const [editableDreams, setEditableDreams] = useState<Dream[]>(dreams);


  const handleDreamChange = (index: number, newContent: string) => {
    const updatedDreams = [...editableDreams];
    updatedDreams[index].content = newContent;
    setEditableDreams(updatedDreams);
  };

  const handleSave = async () => {
    try {
      await Promise.all(
        editableDreams.map((dream) =>
          fetch(`http://localhost:5001/api/dreams/${dream._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: dream.content }),
          })
        )
      );
      alert('All dreams saved!');
    } catch (error) {
      console.error('Error saving dreams:', error);
    }
  };


  return (
    <div style={{ padding: '20px' }}>
      <h1>Edit Wishes with Style ✨</h1>
      {editableDreams.map((dream, index) => (
        // <div key={dream._id}>
        //   <textarea
        //     value={dream.content}
        //     onChange={(e) => handleDreamChange(index, e.target.value)}
        //     style={{ width: '100%', marginBottom: '10px' }}
        //   />
        // </div>
        <div key={dream._id} style={{ marginBottom: '30px' }}>
          <RichTextEditor
            content={dream.content}
            onChange={(newContent) => handleDreamChange(index, newContent)}
          />
        </div>

      ))}
      <button onClick={handleSave}>💾 Save All</button>
      <button>✕ Back</button>
    </div>
  );
};

// 默认导出 DreamEditor 组件
export default DreamEditor;