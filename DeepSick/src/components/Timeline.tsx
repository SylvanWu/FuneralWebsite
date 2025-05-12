// Timeline component that displays a list of memories and provides a callback to delete them
import React from 'react';
import MemoryCard from './MemoryCard';

/** Memory entry type passed in by the parent component */
export interface Memory {
  id: string;                 // If the backend field is _id, please change this and all related keys to _id
  type: 'image' | 'video' | 'text';
  preview: string;            // Preview URL or text
  uploadTime: Date;
  uploaderName?: string;
}

interface TimelineProps {
  memories: Memory[];
  /** Callback passed from the parent component after successful deletion from backend */
  onDeleteMemory: (id: string) => void;
  /** Whether to show the delete button */
  canDelete?: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ memories, onDeleteMemory, canDelete = false }) => {
  /* Wrap internally for <MemoryCard> to call */
  const handleDelete = (id: string) => {
    console.log('Timeline: handleDelete called for ID:', id);
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
      <h2 className="text-2xl font-semibold mb-6 border-b pb-2">
        Memories Timeline
      </h2>

      <div className="space-y-8 timeline-line">
        {memories.map((m) => (
          <MemoryCard
            key={m.id}          /* If the backend field is _id, use m._id here */
            memory={m}
            onDeleteMemory={handleDelete}
            canDelete={canDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default Timeline;
