// Wish editing component (with preview)
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface Dream {
  _id: string;
  content: string;
}

const DreamEditor = () => {
  const location = useLocation();
  // const { ids }: { ids: string[] } = location.state || { ids: [] };

  // const [dreams, setDreams] = useState<Dream[]>([]);
  const { dreams }: { dreams: Dream[] } = location.state || { dreams: [] };

  const [editableDreams, setEditableDreams] = useState<Dream[]>(dreams);
  // useEffect(() => {
  //   const fetchDreamsByIds = async () => {
  //     try {
  //       const fetched = await Promise.all(
  //         ids.map(id =>
  //           fetch(`http://localhost:5001/api/dreams/${id}`).then(res => res.json())
  //         )
  //       );
  //       setDreams(fetched);
  //     } catch (err) {
  //       console.error('Failed to fetch dreams:', err);
  //     }
  //   };

  //   if (ids.length > 0) {
  //     fetchDreamsByIds();
  //   }
  // }, [ids]); // ← Add dependency array to ensure it only triggers when ids change




  const handleDreamChange = (index: number, newContent: string) => {
    // const updatedDreams = [...dreams];
    const updatedDreams = [...editableDreams];
    updatedDreams[index].content = newContent;
    // setDreams(updatedDreams);
    setEditableDreams(updatedDreams);
  };

  const handleSave = async () => {
    try {
      await Promise.all(
        // dreams.map((dream) =>
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
    <div>
      <h1>Edit All Dreams</h1>
      {/* {dreams.map((dream, index) => ( */}
      {editableDreams.map((dream, index) => (
        <div key={dream._id}>
          <textarea
            value={dream.content}
            onChange={(e) => handleDreamChange(index, e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
      ))}
      <button onClick={handleSave}>Save All</button>
    </div>
  );
};

// Default export of the DreamEditor component
export default DreamEditor;