import React, { useEffect, useState } from 'react';
import { Memory } from './Timeline';

interface MemoryCardProps {
  memory: Memory;
  onDelete: (id: string) => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onDelete }) => {
  const [isNew, setIsNew] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    // Remove the "new" animation class after animation completes
    const timer = setTimeout(() => {
      setIsNew(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Delete button clicked for ID:", memory.id);
    if (window.confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      setIsDeleting(true);
      onDelete(memory.id);
    }
  };

  const renderDeleteButton = () => (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        backgroundColor: 'red',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none',
        marginTop: '10px',
        width: '100%'
      }}
    >
      DELETE THIS MEMORY
    </button>
  );

  const renderContent = () => {
    switch (memory.type) {
      case 'image':
        return (
          <div className="mt-3">
            <img
              src={memory.preview}
              alt="Memory"
              className="w-full h-auto rounded-lg"
            />
          </div>
        );
      case 'video':
        return (
          <div className="mt-3">
            <video
              src={memory.preview}
              controls
              className="w-full h-auto rounded-lg"
            />
          </div>
        );
      case 'text':
        return (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg text-gray-700">
            <p>{memory.preview}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg shadow-sm p-5 bg-white ${isNew ? 'memory-card-new' : ''} ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white">
          <span>{memory.uploaderName ? memory.uploaderName.charAt(0).toUpperCase() : 'U'}</span>
        </div>
        <div className="ml-3 timeline-dot">
          <p className="font-medium">{memory.uploaderName || 'Anonymous'}</p>
          <p className="text-sm text-gray-500">{formatDate(memory.uploadTime)}</p>
        </div>
      </div>
      {renderContent()}
      {renderDeleteButton()}
    </div>
  );
};

export default MemoryCard;