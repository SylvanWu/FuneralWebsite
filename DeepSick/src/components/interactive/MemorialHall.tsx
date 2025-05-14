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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Obtain the memories of a specific room
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.userType);
      } else {
        // If no user object, try to get from role
        const roleStr = localStorage.getItem('role');
        setUserRole(roleStr);
      }
    } catch (err) {
      console.error('Failed to parse user data:', err);
      setUserRole(null);
    }
  }, []);
  useEffect(() => {
    const loadMemories = async () => {
      try {
        setIsLoading(true);
        const res = await fetchMemories(roomData.roomId);
        const data = (res.data ?? res) as BackendMemory[];

        if (!Array.isArray(data)) {
          console.error('Expected array of memories but got:', data);
          return;
        }

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
      } finally {
        setIsLoading(false);
      }
    };

    loadMemories();
  }, [roomData.roomId]);

  // Process and repair image urls
  const processImageUrl = (url: string): string => {
    if (!url) return '';


    if (url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }

    // Fix the Windows path separator
    let processedUrl = url.replace(/\\/g, '/');

    // Handle relative paths
    if (!processedUrl.startsWith('http')) {

      const baseUrlWithApi = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const baseUrl = baseUrlWithApi.replace(/\/api$/, '');


      processedUrl = processedUrl
        .replace(/^server\/uploads\//, '')
        .replace(/^uploads\//, '');

      return `${baseUrl}/uploads/${processedUrl}`;
    }

    return processedUrl;
  };

  const handleFileUpload = async (file: File) => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadError(null);

    // Prevent the file from being too large
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File is too large, please upload files smaller than 10MB');
      setIsUploading(false);
      return;
    }

    try {
      let type: 'image' | 'video' | 'text' = 'image';
      let localPreview = '';

      // Local preview processing
      if (file.type.startsWith('image/')) {
        type = 'image';
        localPreview = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        type = 'video';
        localPreview = URL.createObjectURL(file);
      } else if (file.type === 'text/plain') {
        type = 'text';
        const txt = await file.text();
        localPreview = txt.slice(0, 500) + (txt.length > 500 ? '...' : '');
      } else {
        throw new Error(`Unsupported file types: ${file.type}`);
      }

      // The text content is processed separately
      const fd = new FormData();
      fd.append('file', file);
      fd.append('uploaderName', name || 'Anonymous');
      fd.append('memoryType', type);
      fd.append('roomId', roomData.roomId);

      // The text content is processed separately
      if (type === 'text') {
        fd.append('memoryContent', localPreview);
      }

      // Add a local preview first in case the backend upload fails
      const tempId = `temp-${Date.now()}`;
      const tempMemory: Memory = {
        id: tempId,
        type,
        preview: localPreview,
        uploadTime: new Date(),
        uploaderName: name || 'Anonymous',
      };

      setMemories(prev => [tempMemory, ...prev]);

      // Send to the back end
      try {
        const response = await createMemory(fd);

        // Obtain the actual content URL from the back-end response
        let memoryId = '';
        let memoryUrl = '';

        // Handle different response formats
        if (response && typeof response === 'object') {
          if (response.data && typeof response.data === 'object') {
            const data = response.data;
            memoryId = data._id || data.id || '';
            memoryUrl = data.memoryContent || '';
          } else if (response._id || response.id) {
            memoryId = response._id || response.id || '';
            memoryUrl = response.memoryContent || '';
          }
        }

        if (!memoryId) {
          console.error('The response format is invalid and the memory ID was not found:', response);
          throw new Error('The data format returned by the server is invalid');
        }

        // Process the image URL
        if (type === 'image' && !memoryUrl) {
          let filePath = '';
          if (response.data && response.data.file) {
            filePath = response.data.file;
          } else if (response.file) {
            filePath = response.file;
          } else if (typeof response === 'string') {
            filePath = response;
          } else if (response.memoryContent) {
            memoryUrl = response.memoryContent;
          }

          if (filePath && !memoryUrl) {
            memoryUrl = processImageUrl(filePath);
          }
        }
        const finalUrl = memoryUrl || localPreview;

        // Replace temporary memory with formal memory
        setMemories(prev =>
          prev.map(m => m.id === tempId ? {
            ...m,
            id: memoryId,
            preview: finalUrl
          } : m)
        );

        setUploadError(null);
      } catch (err) {
        console.error('Upload to server failed :', err);
        setUploadError(`: ${(err as Error).message || 'Please check the network connection'}`);

        // Do not remove the local preview to allow users to see the uploaded content, but mark it as "local".
        setMemories(prev =>
          prev.map(m => m.id === tempId ? {
            ...m,
            uploaderName: `${m.uploaderName} (Local preview)`
          } : m)
        );
      }
    } catch (err) {
      console.error('预处理上传失败:', err);
      setUploadError((err as Error).message || '上传失败，请重试。');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    // Skip deleting the temporary memory
    if (id.startsWith('temp-')) {
      setMemories(prev => prev.filter(m => m.id !== id));
      return;
    }

    try {
      await deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed, please try again');
    }
  };

  // 检查是否是管理员或组织者
  const isOrganizer = userRole === 'organizer' || userRole === 'admin';

  return (
    <div className="memorial-hall-container">
      {/* Upload the area and user information */}
      <div className="memorial-hall-header">
        <div className="upload-section">
          <h3 className="upload-title">Share a Memory</h3>
          <UploadArea onFileUpload={handleFileUpload} isUploading={isUploading} />
          <p className="upload-note">
            Support for image, video or text files. Please ensure content is appropriate.
          </p>
          {uploadError && (
            <div className="upload-error-message">
              {uploadError}
            </div>
          )}
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

      {/* Timeline area */}
      <div className="timeline-section">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">
            <p>Loading memories...</p>
          </div>
        ) : (
          <Timeline
            memories={memories}
            onDeleteMemory={handleDeleteMemory}
            canDelete={isOrganizer}
          />
        )}
      </div>
    </div>
  );
};

export default MemorialHall; 