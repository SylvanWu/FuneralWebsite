// Main component for wish list management, including add functionality
import React, { useEffect, useRef } from 'react';
import { DreamCard } from './DreamCard';
import '../DreamList/DreamList.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing

// Interface definition for new dreams
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
  // State management for dream list
  const [dreams, setDreams] = useState<Dream[]>([]);
  // User input for wish content
  const [newDreamContent, setNewDreamContent] = useState<string>('');
  // Control input box visibility for adding
  const [showInput, setShowInput] = useState<boolean>(false);

  const navigate = useNavigate(); // Initialize navigate


  useEffect(() => {
    const fetchAllDreams = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/dreams`);
        const data = await res.json();
        setDreams(data);// 更新状态为最新的梦想列表
      } catch (err) {
        console.error('Failed to fetch dreams list:', err);
      }
    };

    fetchAllDreams();
  }, []);

  // Function to create a new dream
  //can:const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/dreams` is the version based on env)
  const createDream = async (content: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/dreams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          position: { x: 0, y: 0 } // Initial position
        })
      });

      if (!response.ok) throw new Error('Creation failed');
      return await response.json();
    } catch (err) {
      console.error('Failed to create a wish:', err);
      throw err;
    }
  };

  // Complete the handleAddDream function
  const handleAddDream = async () => {

    if (!showInput) {
      // If input box is hidden, show it
      setShowInput(true);
      return;
    }

    // If input box is visible, submit content
    if (newDreamContent.trim() === '') {
      alert('Please input the content of your wish');
      return;
    }
    try {
      await createDream(newDreamContent); // First create
      const res = await fetch(`http://localhost:5001/api/dreams`); // Then fetch latest data
      const updatedDreams = await res.json();
      setDreams(updatedDreams); // Update state to avoid inconsistency

      setNewDreamContent(''); // Clear input
      setShowInput(false); // Hide input after submit
    } catch (err) {
      alert('Failed to add. Try again');
    }
  }

  // Press the enter key to add the dream 
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddDream();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setNewDreamContent('');
    }
  }

  // Delete dream function
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/dreams/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('failed to delete');

      setDreams((prev) => prev.filter(dream => dream._id !== id)); // Update state to remove deleted dream
    } catch (err) {
      console.error('failed to delete the wish:', err);
    }
  }

  // Edit button click event
  const handleEdit = (dreamId: string) => {
    // Navigate to edit page, passing dream id
    navigate(`/dreamlist/edit/${dreamId}`);
  };

  const handleEditAll = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/dreams`);
      const data = await res.json();
      // 传递所有的梦想内容
      navigate('/dreamlist/edit', { state: { dreams: data } });
    } catch (err) {
      console.error('Failed to fetch latest dreams:', err);
    }
  };

  return (
    <div>
      <h1 className="dream-list-title">Wish List</h1>
      <div className="dream-list-content">
        {/* Display wish list */}
        {dreams.map(dream => (
          <div key={dream._id} className="dream-item">
            {/* <span>{dream.content}</span> */}
            <span dangerouslySetInnerHTML={{ __html: dream.content }} /> 
            <div className="dream-actions">

              {/* <button className="edit-button">Edit</button> */}
              <button className="delete-button" onClick={() => handleDelete(dream._id)}>Delete</button>
            </div>
          </div>
        ))}
        {/* Input field and add button */}
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

        <button className="edit-toggle-button" onClick={handleEditAll}>
          🖉
        </button>

        <button className="add-button" onClick={handleAddDream}>
          {showInput ? '✓' : '+'}
        </button>
      </div>
    </div>
  );
}

export default DreamList;
