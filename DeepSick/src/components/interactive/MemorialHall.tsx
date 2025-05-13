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
  const role = localStorage.getItem('role');
  
  // 获取特定房间的回忆
  useEffect(() => {
    const loadMemories = async () => {
      try {
        const res = await fetchMemories(roomData.roomId);
        const data = (res.data ?? res) as BackendMemory[];
        console.log('Fetched memories:', data); // 添加日志用于调试
        
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
      }
    };
    
    loadMemories();
  }, [roomData.roomId]);

  const handleFileUpload = async (file: File) => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadError(null);
    
    try {
      let type: 'image' | 'video' | 'text' = 'image';
      let localPreview = '';
      
      // 本地预览处理
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
        throw new Error(`不支持的文件类型: ${file.type}`);
      }

      // 准备上传表单数据
      const fd = new FormData();
      fd.append('file', file);
      fd.append('uploaderName', name || 'Anonymous');
      fd.append('memoryType', type);
      fd.append('roomId', roomData.roomId);
      
      // 文本内容单独处理
      if (type === 'text') {
        fd.append('memoryContent', localPreview);
      }

      console.log('上传内存:', {
        type,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploaderName: name || 'Anonymous',
        roomId: roomData.roomId
      });

      // 发送到后端
      const response = await createMemory(fd);
      console.log('上传响应:', response);
      
      // 从后端响应中获取实际内容URL
      let memoryId = '';
      let memoryUrl = '';
      
      // 处理不同的响应格式
      if (response && typeof response === 'object') {
        if (response.data && typeof response.data === 'object') {
          // 标准响应格式，数据在data字段中
          const data = response.data;
          memoryId = data._id || data.id || '';
          memoryUrl = data.memoryContent || '';
        } else if (response._id || response.id) {
          // 直接在response中包含数据
          memoryId = response._id || response.id || '';
          memoryUrl = response.memoryContent || '';
        }
      }
      
      if (!memoryId) {
        console.error('响应格式无效，未找到记忆ID:', response);
        throw new Error('服务器返回的数据格式无效');
      }
      
      // 图片路径处理
      if (type === 'image') {
        // 尝试从响应中找文件路径
        let filePath = '';
        if (response.data && response.data.file) {
          filePath = response.data.file;
        } else if (response.file) {
          filePath = response.file;
        } else if (typeof response === 'string') {
          filePath = response;
        }
        
        if (filePath) {
          // 修复Windows路径分隔符
          filePath = filePath.replace(/\\/g, '/');
          
          // 构建完整URL
          if (!memoryUrl) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            
            // 如果路径以server/uploads开头，去除server前缀
            if (filePath.startsWith('server/uploads/')) {
              filePath = filePath.replace(/^server\/uploads\//, '');
              memoryUrl = `${baseUrl}/uploads/${filePath}`;
            } 
            // 如果路径以uploads开头
            else if (filePath.startsWith('uploads/')) {
              filePath = filePath.replace(/^uploads\//, '');
              memoryUrl = `${baseUrl}/uploads/${filePath}`;
            }
            // 其他情况直接使用文件名部分
            else {
              const fileName = filePath.split('/').pop();
              memoryUrl = `${baseUrl}/uploads/${fileName}`;
            }
          }
        }
      }
      
      // 最后如果还是没有URL，退回到使用本地预览
      const finalUrl = memoryUrl || localPreview;
      
      console.log('要使用的内存URL:', finalUrl);
      
      // 添加到内存中的列表
      setMemories(prev => [
        {
          id: memoryId,
          type,
          preview: finalUrl,
          uploadTime: new Date(),
          uploaderName: name || 'Anonymous',
        },
        ...prev,
      ]);
      
      setUploadError(null);
    } catch (err) {
      console.error('上传失败:', err);
      setUploadError((err as Error).message || '上传失败，请重试。');
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