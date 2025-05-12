// drag with the mouse can move the wish box
import React, { useEffect, useRef } from 'react';
import '../DreamList/DreamList.css';

export const DreamCard = ({ children, shrunk = false }: { children: React.ReactNode; shrunk?: boolean }) => {
  // Use useRef to reference the DOM element for later operations
  const dragRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  // Flag to indicate whether dragging is in progress
  const isDragging = useRef(false);


  // Side effect executed after the component is mounted
  useEffect(() => {
    // Get the referenced DOM element
    const divElement = dragRef.current;
    if (divElement) {
      // Add mouse down, up, and move event listeners to the element
      divElement.addEventListener('mousedown', handleMouseDown);
      // Add mouse up event listener to the whole document
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);

      // Cleanup function executed when the component unmounts
      return () => {
        // Remove event listeners to prevent memory leaks
        divElement.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []); //  An empty dependency array means this runs only on mount and unmount

  // handleMouseDown function triggered on mouse down
  const handleMouseDown = (e: MouseEvent) => {
    if (dragRef.current) {
      startX.current = e.clientX;
      startY.current = e.clientY;
      // Dragging in progress
      isDragging.current = true;
    }
  };

  // handleMouseMove function triggered on mouse move
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current && dragRef.current) {
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;

      const div = dragRef.current;

      // Get the current element position and add the movement offset to calculate the new position
      const left = parseInt(div.style.left || '0', 10) + dx;
      const top = parseInt(div.style.top || '0', 10) + dy;

      // Set the new position of the element
      div.style.left = `${left}px`;
      div.style.top = `${top}px`;

      // Update mouse position record for the next move calculation
      startX.current = e.clientX;
      startY.current = e.clientY;
    }
  };

  // handleMouseUp function triggered on mouse up
  const handleMouseUp = () => {
    // Stop dragging
    isDragging.current = false;
  };

  return (
    <div
      ref={dragRef} // Bind ref to this div
      className={`dream-card ${shrunk ? 'shrunk' : ''}`} // Key: Dynamically apply the shrunk style class
      style={{
        position: 'absolute', // Use absolute positioning to enable dragging
        top: 100, // Initial top position
        left: 100, // Initial left position
        cursor: 'grab' // Show grab cursor when hovering
      }}
    >
      {children}
    </div>
  )


}