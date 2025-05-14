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
      e.target.value = ''; // Clear the input field to allow selecting the same file again next time
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
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all w-full
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${isUploading ? 'pointer-events-none opacity-60' : ''}
        bg-gray-50
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
            <svg 
              className="text-blue-500 animate-spin mb-2" 
              style={{width: '30px', height: '30px'}}
              width="20" 
              height="20" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
              />
            </svg>
            <p className="text-sm text-gray-600">上传中，请稍候...</p>
          </>
        ) : (
          <>
            <svg 
              className="text-gray-400 mb-2" 
              style={{width: '30px', height: '30px'}}
              width="20" 
              height="20" 
              fill="none" 
              viewBox="0 0 40 40" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="40" height="40" rx="6" fill="#F5F5F5" />
              <path d="M20 11V23M20 11L15 16M20 11L25 16" stroke="#BFBFBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 26L11 28C11 28.5523 11.4477 29 12 29L28 29C28.5523 29 29 28.5523 29 28L29 26" stroke="#BFBFBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm font-medium text-gray-600">Click or drag file to this area to upload</p>
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