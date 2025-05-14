import React, { useEffect, useState } from 'react';
import UploadArea from '../components/UploadArea';
import Timeline, { Memory } from '../components/Timeline';
import { fetchMemories, createMemory, deleteMemory } from '../api';
import './HallPage.css';

interface BackendMemory {
  _id: string;
  uploaderName: string;
  uploadTime: string;
  memoryType: 'image' | 'video' | 'text';
  memoryContent: string;
}

const HallPage: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [name, setName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const role = localStorage.getItem('role');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchMemories();
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
        console.error('Failed to fetch memories:', err);
      }
    })();
  }, []);

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
    <div className="hall-container">
      {/* Two-column layout main section */}
      <div className="hall-header-section">
        {/* Left image */}
        <div className="hall-image-container">
          <img
            src="/photo2.png"
            alt="Digital Memorial Hall"
            className="hall-image"
          />
        </div>

        {/* Right content area */}
        <div className="hall-content">


          <div className="upload-section">
            <UploadArea onFileUpload={handleFileUpload} isUploading={isUploading} />
            <p className="upload-note">
              Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files
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
      </div>

      {/* Timeline section */}
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

export default HallPage;
