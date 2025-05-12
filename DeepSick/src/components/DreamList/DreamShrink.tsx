import React, { useRef, useState } from 'react';
import DreamList from './DreamList'; // Import wish list component
import '../DreamList/DreamList.css'; // Import CSS styles
import pokemon from '../../assets/5IPv.gif';
import { DreamCard } from './DreamCard'; // ✅ Use draggable outer wrapper

const DreamShrink = () => {
  const [isShrunk, setIsShrunk] = useState(false); // Controls shrink/expand state

  // Used to detect whether it's a click (vs drag)
  const clickStart = useRef({ x: 0, y: 0 });

  // Toggle the value of isShrunk
  const toggleShrink = () => {
    setIsShrunk(!isShrunk);
  };

  // Record the mouse down position
  const handleMouseDown = (e: React.MouseEvent) => {
    clickStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const dx = Math.abs(e.clientX - clickStart.current.x);
    const dy = Math.abs(e.clientY - clickStart.current.y);
    const isClick = dx < 5 && dy < 5;
    if (isClick) {
      toggleShrink();
    }
  };

  // Determine if it's a true click (vs drag)
  const handleClick = (e: React.MouseEvent) => {
    const dx = Math.abs(e.clientX - clickStart.current.x);
    const dy = Math.abs(e.clientY - clickStart.current.y);
    const isClick = dx < 5 && dy < 5; // Only small movement is considered a click

    if (isClick) {
      toggleShrink(); // Only toggle if it's an actual click
    }
  };

  return (
    <DreamCard shrunk={isShrunk}>
      <div className={`dream-shrink-container ${isShrunk ? 'shrunk' : ''}`}>
        {/* Layer 1: Button or Pikachu icon */}
        <div>
          {isShrunk ? (
            <img
              src={pokemon}
              alt="Pikachu"
              className="jirachi-icon-shrunk"
              onMouseDown={handleMouseDown} // New
              onMouseUp={handleMouseUp}     // New
              // onClick={toggleShrink}
            />
          ) : (
            <button className="shrink-button" onClick={toggleShrink}>
              -
            </button>
          )}
        </div>

        {/* Layer 2: Wish list section */}
        <div style={{ display: isShrunk ? 'none' : 'block' }}>
          <DreamList />
        </div>
      </div>
    </DreamCard>
  );
};

export default DreamShrink;
