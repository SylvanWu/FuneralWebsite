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
  
  // 获取用户角色
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.userType);
      } else {
        // 如果没有user对象，尝试从role中获取
        const roleStr = localStorage.getItem('role');
        setUserRole(roleStr);
      }
    } catch (err) {
      console.error('Failed to parse user data:', err);
      setUserRole(null);
    }
  }, []);
  
  // 获取特定房间的回忆
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

  // 处理与修复图片URL
  const processImageUrl = (url: string): string => {
    if (!url) return '';
    
    // 如果是blob或data URL直接返回
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    
    // 修复Windows路径分隔符
    let processedUrl = url.replace(/\\/g, '/');
    
    // 处理相对路径
    if (!processedUrl.startsWith('http')) {
      // 获取基础URL，但移除/api后缀，因为静态资源不在/api路径下
      const baseUrlWithApi = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const baseUrl = baseUrlWithApi.replace(/\/api$/, '');
      
      // 移除server前缀和uploads前缀
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
    
    // 防止文件过大
    if (file.size > 10 * 1024 * 1024) { // 10MB 限制
      setUploadError('文件太大，请上传10MB以下的文件');
      setIsUploading(false);
      return;
    }
    
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
      
      // 先添加本地预览，以防后端上传失败
      const tempId = `temp-${Date.now()}`;
      const tempMemory: Memory = {
        id: tempId,
        type,
        preview: localPreview,
        uploadTime: new Date(),
        uploaderName: name || 'Anonymous',
      };
      
      setMemories(prev => [tempMemory, ...prev]);

      // 发送到后端
      try {
        const response = await createMemory(fd);
        
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
        
        // 处理图片URL
        if (type === 'image' && !memoryUrl) {
          // 尝试从响应中找文件路径
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
        
        // 最后如果还是没有URL，退回到使用本地预览
        const finalUrl = memoryUrl || localPreview;
        
        // 用正式记忆替换临时记忆
        setMemories(prev => 
          prev.map(m => m.id === tempId ? {
            ...m,
            id: memoryId,
            preview: finalUrl
          } : m)
        );
        
        setUploadError(null);
      } catch (err) {
        console.error('上传到服务器失败:', err);
        setUploadError(`上传到服务器失败: ${(err as Error).message || '请检查网络连接'}`);
        
        // 不移除本地预览，让用户看到已上传内容，但标记为"本地"
        setMemories(prev => 
          prev.map(m => m.id === tempId ? {
            ...m,
            uploaderName: `${m.uploaderName} (本地预览)`
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
    // 跳过删除临时内存
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