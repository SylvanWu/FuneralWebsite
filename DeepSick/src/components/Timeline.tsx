//时间线组件，展示记忆内容列表，并提供删除记忆内容的回调函数。
import React from 'react';
import MemoryCard from './MemoryCard';

/** 供父组件传入的内存条目类型 */
export interface Memory {
  id: string;                 // 如果后端字段叫 _id，请把这里和 key 全部改成 _id
  type: 'image' | 'video' | 'text';
  preview: string;            // 预览 URL 或文字
  uploadTime: Date;
  uploaderName?: string;
}

interface TimelineProps {
  memories: Memory[];
  /** 删除后端记录成功后，父组件传来的回调 */
  onDeleteMemory: (id: string) => void;
  /** 是否显示删除按钮 */
  canDelete?: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ memories, onDeleteMemory, canDelete = false }) => {
  /* 内部再包一层，方便 <MemoryCard> 调用 */
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
            key={m.id}          /* 如果后端字段是 _id 就写 m._id */
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