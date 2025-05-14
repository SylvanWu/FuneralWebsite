// drag with the mouse can move the wish box
import React, { useEffect, useRef, useState } from 'react';
import '../DreamList/DreamList.css';

export const DreamCard = ({ children, shrunk = false }: { children: React.ReactNode; shrunk?: boolean }) => {
  // Use useRef to reference the DOM element for later operations
  const dragRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  // Store the initial location
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const horizontalPercent = 70;
  const verticalPercent = -8;

  useEffect(() => {
    const handleResize = () => {
      const cardWidth = 400;
      const cardHeight = 300;

      // Calculate position
      const x = Math.max(0, window.innerWidth * (1 - horizontalPercent / 100) - cardWidth);
      const y = Math.max(0, window.innerHeight * (1 - verticalPercent / 100) - cardHeight);

      setInitialPosition({ x, y });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [horizontalPercent, verticalPercent]);


  useEffect(() => {
    // Get the referenced DOM element，Add mouse down，Add mouse up
    const divElement = dragRef.current;
    if (divElement) {
      divElement.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);

      // Cleanup function executed when the component unmounts
      return () => {

        divElement.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []);

  // handleMouseDown function triggered on mouse down
  const handleMouseDown = (e: MouseEvent) => {
    if (dragRef.current) {
      startX.current = e.clientX;
      startY.current = e.clientY;
      isDragging.current = true;
    }
  };

  // handleMouseMove function triggered on mouse move
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current && dragRef.current) {
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      const div = dragRef.current;

      // Get the current element position and add the movement offset 
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
      ref={dragRef}
      className={`dream-card ${shrunk ? 'shrunk' : ''}`}
      style={{
        position: 'absolute',
        top: initialPosition.y,
        left: initialPosition.x,
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        width: shrunk ? '80px' : '400px',
        height: shrunk ? '80px' : 'auto',
      }}
    >
      {children}
    </div>
  )

}