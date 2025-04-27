import React from 'react';
import MemoryCard from './MemoryCard';

export interface Memory {
  id: string;
  file?: File;
  type: 'image' | 'video' | 'text';
  preview: string;
  uploadTime: Date;
  uploaderName?: string;
}

interface TimelineProps {
  memories: Memory[];
  onDeleteMemory: (id: string) => void;
}

const Timeline: React.FC<TimelineProps> = ({ memories, onDeleteMemory }) => {
  const handleDelete = (id: string) => {
    console.log("Timeline: handleDelete called for ID:", id);
    onDeleteMemory(id);
  };

  if (memories.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No memories have been added yet. Upload your first memory above.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Memories Timeline</h2>
      <div className="space-y-8 timeline-line">
        {memories.map((memory) => (
          <MemoryCard 
            key={memory.id} 
            memory={memory} 
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default Timeline; 