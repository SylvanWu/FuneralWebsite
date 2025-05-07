// export default UploadArea;
import React, { useRef, useState } from 'react';

interface UploadAreaProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFileUpload, isUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
      e.target.value = ''; // 清空输入框以便下次选择同一个文件
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
      <div
          className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer mb-10 transition-all
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${isUploading ? 'pointer-events-none opacity-60' : ''}
      `}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => {
            if (!isUploading && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
      >
        <div className="flex flex-col items-center justify-center">
          {isUploading ? (
              <>
                <svg className="w-8 h-8 text-blue-500 animate-spin mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                  />
                </svg>
                <p className="text-sm text-gray-600">正在上传，请稍候...</p>
              </>
          ) : (
              <>
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-lg font-medium mb-1">点击或拖拽文件到此处上传</p>
                <p className="text-sm text-gray-500">支持上传图片、视频或纯文本文件</p>
              </>
          )}
          <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              accept="image/*,video/*,text/plain"
          />
        </div>
      </div>
  );
};

export default UploadArea;