// Memory content card component that displays the uploader, time, and specific content (image, video, or text), with delete functionality.
import React, { useEffect, useState } from 'react';
import { Memory } from './Timeline';

interface MemoryCardProps {
    memory: Memory;
    onDeleteMemory: (id: string) => void;
    canDelete?: boolean;
}

const MemoryCard: React.FC<MemoryCardProps> = ({
    memory,
    onDeleteMemory,
    canDelete = false
}) => {
    const [isNew, setIsNew] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [imageError, setImageError] = useState(false);
    const [imageSrc, setImageSrc] = useState<string>(memory.preview);

    /* Entry animation, runs only once on initial mount */
    useEffect(() => {
        const timer = setTimeout(() => setIsNew(false), 500);
        return () => clearTimeout(timer);
    }, []);

    /* 修复路径并处理图片URL */
    useEffect(() => {
        if (memory.type === 'image') {
            // 修复路径中的反斜杠问题
            let src = memory.preview;
            
            // 1. 将所有反斜杠替换为正斜杠
            src = src.replace(/\\/g, '/');
            
            // 2. 处理相对路径
            if (src && !src.startsWith('http') && !src.startsWith('blob:') && !src.startsWith('data:')) {
                // 2.1 构建基础URL
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                
                // 2.2 移除多余的server前缀（如果存在）
                if (src.startsWith('server/')) {
                    src = src.replace(/^server\//, '');
                }
                
                // 2.3 构建完整路径
                src = `${baseUrl}/uploads/${src.replace(/^uploads\//, '')}`;
            }
            
            console.log('Memory image processing:', { 
                original: memory.preview, 
                processed: src 
            });
            
            setImageSrc(src);
            
            const img = new Image();
            img.onload = () => {
                console.log('Image loaded successfully:', src);
                // 计算合适的显示尺寸
                const maxWidth = 800; // 最大宽度
                const maxHeight = 600; // 最大高度
                let width = img.width;
                let height = img.height;

                // 如果图片尺寸超过最大限制，按比例缩放
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                setImageSize({ width, height });
                setImageError(false);
            };
            
            img.onerror = (err) => {
                console.error('Failed to load image:', src, err);
                
                // 尝试另一种URL格式
                if (src !== memory.preview) {
                    console.log('Trying alternative URL format');
                    // 尝试直接访问uploads文件夹
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                    const fileName = src.split('/').pop(); // 获取文件名部分
                    const altSrc = `${baseUrl.replace(/\/api$/, '')}/uploads/${fileName}`;
                    
                    console.log('Alternative URL:', altSrc);
                    setImageSrc(altSrc);
                    
                    // 使用替代URL重新加载
                    const altImg = new Image();
                    altImg.onload = () => {
                        console.log('Alternative image URL loaded successfully');
                        setImageError(false);
                    };
                    altImg.onerror = () => {
                        console.error('Alternative image URL also failed');
                        // 最后尝试直接用原始URL
                        const originalFixed = memory.preview.replace(/\\/g, '/');
                        console.log('Last attempt with original URL (fixed slashes):', originalFixed);
                        setImageSrc(originalFixed);
                        setImageError(true);
                    };
                    altImg.src = altSrc;
                } else {
                    setImageError(true);
                }
            };
            
            img.src = src;
        }
    }, [memory]);

    const formatDate = (date: Date) =>
        date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (
            window.confirm(
                'Are you sure you want to delete this memory? This action cannot be undone.',
            )
        ) {
            setIsDeleting(true);
            onDeleteMemory(memory.id);
        }
    };

    const renderContent = () => {
        switch (memory.type) {
            case 'image':
                return (
                    <div className="mt-3 flex justify-center">
                        {imageError ? (
                            <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                                <p>Failed to load image</p>
                                <p className="text-xs overflow-auto max-w-md">{memory.preview}</p>
                                {imageSrc !== memory.preview && (
                                    <p className="text-xs overflow-auto max-w-md">Tried: {imageSrc}</p>
                                )}
                                <button 
                                    className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
                                    onClick={() => window.open(imageSrc, '_blank')}
                                >
                                    打开图片链接
                                </button>
                            </div>
                        ) : (
                            <img
                                src={imageSrc}
                                alt="Memory"
                                className="rounded-lg"
                                style={{
                                    width: imageSize.width || 'auto',
                                    height: imageSize.height || 'auto',
                                    maxWidth: '100%',
                                    objectFit: 'contain'
                                }}
                                onError={(e) => {
                                    console.error('Image error on render:', e);
                                    setImageError(true);
                                }}
                            />
                        )}
                    </div>
                );
            case 'video':
                return (
                    <video
                        src={memory.preview}
                        controls
                        className="mt-3 w-full h-auto rounded-lg"
                        onError={(e) => console.error('Video error:', e)}
                    />
                );
            default: // 'text'
                return (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg text-gray-700">
                        {memory.preview}
                    </div>
                );
        }
    };

    return (
        <div
            className={`border border-gray-200 rounded-lg shadow-sm p-5 bg-white ${isNew ? 'memory-card-new' : ''
                } ${isDeleting ? 'opacity-50' : ''}`}
        >
            {/* Header: avatar + uploader + time */}
            <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white">
                    <span>
                        {(memory.uploaderName || 'U').charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="ml-3 timeline-dot">
                    <p className="font-medium">
                        {memory.uploaderName || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500">
                        {formatDate(memory.uploadTime)}
                    </p>
                </div>
            </div>

            {/* 显示内存ID和类型用于调试 */}
            <div className="text-xs text-gray-400 mt-1 mb-2">
                ID: {memory.id} | Type: {memory.type}
            </div>

            {/* Main content (image / video / text) */}
            {renderContent()}

            {/* Delete button, shown only when canDelete is true */}
            {canDelete && (
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="mt-4 w-full py-2 rounded bg-gray-700 text-white font-semibold disabled:opacity-60 hover:bg-gray-800"
                >
                    DELETE THIS MEMORY
                </button>
            )}
        </div>
    );
};

export default MemoryCard;
