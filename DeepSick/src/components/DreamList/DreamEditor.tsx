// Wish editing component (with preview)
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import RichTextEditor from './RichTextEditor';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

interface Dream {
  _id: string;
  content: string;
}

const DreamEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dreams }: { dreams: Dream[] } = location.state || { dreams: [] };
  const { roomId } = useParams();
  console.log('当前的 roomId:', roomId);  // 检查 roomId 是否正确
  useEffect(() => {
    console.log('📥 当前传递给子组件的 dreams 数据：', dreams);
  }, [dreams]);  // 仅当 dreams 发生变化时触发

  // ✅ 在这里打印看看 dreams 的内容
  console.log('💡 初始 dreams 数据:', dreams);
  const [editableDreams, setEditableDreams] = useState<Dream[]>(dreams);

  const handleDreamChange = (index: number, newContent: string) => {
    const updatedDreams = [...editableDreams];
    updatedDreams[index].content = newContent;
    setEditableDreams(updatedDreams);
  };

  const handleSave = async () => {
    try {
      console.log("保存的内容：", editableDreams);  // 打印要保存的数据
      await Promise.all(
        editableDreams.map((dream) =>
          fetch(`http://localhost:5001/api/dreams/${dream._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: dream.content }),
          })
        )
      );
      alert('All dreams saved!');
      // navigate('/dreamlist');
      // 保存完成后跳转到 dreamlist 页面
      if (roomId) {
        navigate(`/interactive/${roomId}`); // 跳转到指定的 roomId 页面
      } else {
        alert('Room ID is undefined! Please check the URL.');
      }
    } catch (error) {
      console.error('Error saving dreams:', error);
      alert('Failed to save dreams, please try again.');
    }
  };




  const handleCancel = () => {
    if (roomId) {
      navigate(`/interactive/${roomId}`); // 取消时，返回房间页面
    }
  };

  return (
    <div style={{ paddingLeft: '400px', paddingTop: '20px' }}> {/* 👈 加 paddingLeft 右移 */}
      <h1>Edit Dreams with Style ✨</h1>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '30px', paddingTop: '100px' }}>
        {/* 左边：编辑器区域 */}
        <div style={{ flex: '0 0 700px' }}>  {/* 设置左边宽度为 350px */}
          {editableDreams.map((dream, index) => (
            <div key={dream._id} style={{ marginBottom: '30px' }}>
              <RichTextEditor
                content={dream.content}
                onChange={(newContent) => handleDreamChange(index, newContent)}
              />
            </div>
          ))}
        </div>

        {/* 右边：合并预览区域 */}
        <div
          className="dream-card"
          style={{
            width: '400px',
            marginTop: '0px',
            backgroundColor: '#f5f5f5',
            padding: '10px',
            border: '1px solid #ccc',
            flexShrink: 0, // ✅ 防止被压缩
          }}
        >
          <h2>Wish List</h2>
          <div className="dream-list-content">
            {editableDreams.map((dream) => (
              <div
                key={dream._id}
                className="dream-item"
                style={{ marginBottom: '10px' }}
                dangerouslySetInnerHTML={{ __html: dream.content }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button onClick={handleSave}>💾 Save All</button>
        <span> </span>
        <button onClick={handleCancel}>❌ Cancel</button>
      </div>
    </div>
  );

};

// Default export of the DreamEditor component
export default DreamEditor;
