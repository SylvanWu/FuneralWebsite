import React, { useEffect, useState } from 'react';
import UploadArea from '../UploadArea';
import Timeline, { Memory } from '../Timeline';
import { fetchMemories, createMemory, deleteMemory } from '../../api';
import { RoomData } from './InteractionSection';
import './MemorialHall.css';

interface MemorialHallProps {
  roomData: RoomData;
}

interface BackendMemory {
  _id: string;
  uploaderName: string;
  uploadTime: string;
  memoryType: 'image' | 'video' | 'text';
  memoryContent: string;
  roomId?: string;
}

const MemorialHall: React.FC<MemorialHallProps> = ({ roomData }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [name, setName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const role = localStorage.getItem('role');
  
  // 获取特定房间的回忆
  useEffect(() => {
    const loadMemories = async () => {
      try {
        const res = await fetchMemories(roomData.roomId);
        const data = (res.data ?? res) as BackendMemory[];
        setMemories(
          data.map(m => ({
            id: m._id,
            type: m.memoryType,
            preview: m.memoryContent,
            uploadTime: new Date(m.uploadTime),
            uploaderName: m.uploaderName,
          }))
        );
      } catch (err) {
        console.error(`Failed to fetch memories for room ${roomData.roomId}:`, err);
      }
    };
    
    loadMemories();
  }, [roomData.roomId]);

  const handleFileUpload = async (file: File) => {
    if (isUploading) return;
    setIsUploading(true);
    try {
      let type: 'image' | 'video' | 'text' = 'image';
      let preview = '';
      let memoryContent = '';

      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
        memoryContent = preview;
      } else if (file.type.startsWith('video/')) {
        type = 'video';
        preview = URL.createObjectURL(file);
        memoryContent = preview;
      } else if (file.type === 'text/plain') {
        type = 'text';
        const txt = await file.text();
        preview = txt.slice(0, 500) + (txt.length > 500 ? '...' : '');
        memoryContent = txt;
      }

      const fd = new FormData();
      fd.append('file', file);
      fd.append('uploaderName', name || 'Anonymous');
      fd.append('memoryType', type);
      fd.append('roomId', roomData.roomId);
      if (type === 'text') fd.append('memoryContent', memoryContent);

      const resp = await createMemory(fd);
      setMemories(prev => [
        {
          id: resp.data._id,
          type,
          preview,
          uploadTime: new Date(),
          uploaderName: name || 'Anonymous',
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed, please try again');
    }
  };

  return (
    <div className="memorial-hall-container">
      {/* 上传区域和用户信息 */}
      <div className="memorial-hall-header">
        <div className="upload-section">
          <h3 className="upload-title">Share a Memory</h3>
          <UploadArea onFileUpload={handleFileUpload} isUploading={isUploading} />
          <p className="upload-note">
            Support for image, video or text files. Please ensure content is appropriate.
          </p>
        </div>
        
        <div className="name-input-container">
          <label className="name-label">
            Your Name (Optional)
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Please enter your name"
            className="name-input"
          />
        </div>
      </div>
      
      {/* 时间线区域 */}
      <div className="timeline-section">
        <Timeline
          memories={memories}
          onDeleteMemory={handleDeleteMemory}
          canDelete={role === 'admin'}
        />
      </div>
    </div>
  );
};

export default MemorialHall; 