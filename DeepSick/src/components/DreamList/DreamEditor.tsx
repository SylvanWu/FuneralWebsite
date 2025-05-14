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
  useEffect(() => {
    console.log('The dreams data currently passed to the child component:', dreams);
  }, [dreams]);


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
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: dream.content }),
          })
        )
      );
      alert('All dreams saved!');
      if (roomId) {
        navigate(`/interactive/${roomId}`);
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
      navigate(`/interactive/${roomId}`);
    }
  };

  return (
    <div style={{ paddingLeft: '400px', paddingTop: '20px' }}>
      <h1>Edit Dreams with Style ✨</h1>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '30px', paddingTop: '100px' }}>
        {/* Left: Editor area */}
        <div style={{ flex: '0 0 700px' }}>
          {editableDreams.map((dream, index) => (
            <div key={dream._id} style={{ marginBottom: '30px' }}>
              <RichTextEditor
                content={dream.content}
                onChange={(newContent) => handleDreamChange(index, newContent)}
              />
            </div>
          ))}
        </div>

        {/* Right: Merge preview area */}
        <div
          className="dream-card"
          style={{
            width: '400px',
            marginTop: '0px',
            backgroundColor: '#f5f5f5',
            padding: '10px',
            border: '1px solid #ccc',
            flexShrink: 0,
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

      {/* Operation button */}
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
