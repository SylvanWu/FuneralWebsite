// Main component for wish list management, including add functionality
import React, { useEffect } from 'react';
import '../DreamList/DreamList.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

// Interface definition for new dreams
interface Dream {
  _id: string;
  content: string;
  position: {
    x: number;
    y: number;
  };
}


export function DreamList(props: { roomId?: string }) {
  const { roomId } = useParams();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [newDreamContent, setNewDreamContent] = useState<string>('');
  const [showInput, setShowInput] = useState<boolean>(false);

  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    if (!roomId) return;

    const fetchDreams = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/dreams/${roomId}`);
        const data = await res.json();
        setDreams(data);
      } catch (err) {
        console.error('Failed to fetch dreams list:', err);
      }
    };

    fetchDreams();
  }, [roomId]);


  // Function to create a new dream
  const createDream = async (content: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/dreams/${roomId}`, {
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
      setShowInput(true);
      return;
    }

    // If input box is visible, submit content
    if (newDreamContent.trim() === '') {
      alert('Please input the content of your wish');
      return;
    }
    try {
      await createDream(newDreamContent);
      const res = await fetch(`http://localhost:5001/api/dreams/${roomId}`);
      const updatedDreams = await res.json();
      setDreams(updatedDreams);

      setNewDreamContent('');
      setShowInput(false);
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

      setDreams((prev) => prev.filter(dream => dream._id !== id));
    } catch (err) {
      console.error('failed to delete the wish:', err);
    }
  }


  const handleEditAll = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/dreams/${roomId}`);
      const data = await res.json();
      navigate(`/interactive/${roomId}/edit`, { state: { dreams: data } });
    } catch (err) {
      console.error('Failed to fetch latest dreams:', err);
    }
  };

  return (
    <div>
      <h1 className="dream-list-title">Wish List</h1>
      <div className="dream-list-content">
        {dreams.map(dream => (
          <div key={dream._id} className="dream-item">
            <span dangerouslySetInnerHTML={{ __html: dream.content }} />
            <div className="dream-actions">
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