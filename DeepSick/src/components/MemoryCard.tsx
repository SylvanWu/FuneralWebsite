// Memory content card component that displays the uploader, time, and specific content (image, video, or text), with delete functionality.
import React, { useEffect, useState } from 'react';
import { Memory } from './Timeline';

interface MemoryCardProps {
    memory: Memory;
    onDeleteMemory: (id: string) => void;
    canDelete?: boolean;
}

// 默认图片，用于图片加载失败或URL为空时显示
const DEFAULT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3Cpath d="M30,40 L70,40 L70,60 L30,60 Z" fill="%23ddd"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="8" text-anchor="middle" alignment-baseline="middle" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';

const MemoryCard: React.FC<MemoryCardProps> = ({
    memory,
    onDeleteMemory,
    canDelete = false
}) => {
    const [isNew, setIsNew] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [imageError, setImageError] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [videoError, setVideoError] = useState(false);
    const [attemptCount, setAttemptCount] = useState(0);

    /* Entry animation, runs only once on initial mount */
    useEffect(() => {
        const timer = setTimeout(() => setIsNew(false), 500);
        return () => clearTimeout(timer);
    }, []);

    /* 修复路径并处理图片和视频URL */
    useEffect(() => {
        if (memory.type === 'image') {
            // 重置加载状态
            setImageError(false);
            setAttemptCount(0);
            
            // 处理图片URL
            processMediaUrl(memory.preview, 'image');
        } else if (memory.type === 'video') {
            // 重置视频加载状态
            setVideoError(false);
            setAttemptCount(0);
            
            // 处理视频URL
            processMediaUrl(memory.preview, 'video');
        }
    }, [memory]);

    // 媒体URL处理函数 - 统一处理图片和视频URL
    const processMediaUrl = (originalUrl: string, mediaType: 'image' | 'video') => {
        try {
            // 如果URL为空或无效，显示错误
            if (!originalUrl || originalUrl.trim() === '') {
                console.error(`Empty or invalid ${mediaType} URL`);
                if (mediaType === 'image') {
                    setImageSrc(DEFAULT_IMAGE);
                    setImageError(true);
                } else {
                    setVideoSrc(null);
                    setVideoError(true);
                }
                return;
            }

            // 清理和标准化URL
            let processedUrl = originalUrl.trim();
            
            // 1. 替换反斜杠
            processedUrl = processedUrl.replace(/\\/g, '/');
            
            // 2. 已经是完整URL的情况
            if (processedUrl.startsWith('blob:') || processedUrl.startsWith('data:')) {
                console.log(`Using direct blob/data URL for ${mediaType}:`, processedUrl);
                if (mediaType === 'image') {
                    setImageSrc(processedUrl);
                } else {
                    setVideoSrc(processedUrl);
                }
                return;
            }

            // 3. 相对路径处理
            if (!processedUrl.startsWith('http')) {
                // 获取基础URL，但移除/api后缀，因为静态资源不在/api路径下
                const baseUrlWithApi = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                const baseUrl = baseUrlWithApi.replace(/\/api$/, '');
                
                // 移除server前缀和多余的路径
                processedUrl = processedUrl
                    .replace(/^server\/uploads\//, '')
                    .replace(/^uploads\//, '');
                
                // 确保处理后的URL不为空
                if (!processedUrl || processedUrl === '') {
                    console.error(`Invalid ${mediaType} path after processing`);
                    if (mediaType === 'image') {
                        setImageSrc(DEFAULT_IMAGE);
                        setImageError(true);
                    } else {
                        setVideoSrc(null);
                        setVideoError(true);
                    }
                    return;
                }
                
                // 构建不同的URL选项尝试加载
                const options = [
                    `${baseUrl}/uploads/${processedUrl}`,
                    `${baseUrlWithApi}/uploads/${processedUrl}`,
                    `http://localhost:5001/uploads/${processedUrl}`
                ];
                
                if (mediaType === 'image') {
                    loadImageWithFallbacks(options);
                } else {
                    loadVideoWithFallbacks(options);
                }
                return;
            }
            
            // 4. 已经是HTTP URL但可能格式不正确
            // 尝试移除可能的/api路径
            if (processedUrl.includes('/api/uploads/')) {
                processedUrl = processedUrl.replace('/api/uploads/', '/uploads/');
            }
            
            if (mediaType === 'image') {
                setImageSrc(processedUrl);
            } else {
                setVideoSrc(processedUrl);
            }
            console.log(`Using provided HTTP URL for ${mediaType}:`, processedUrl);
        } catch (err) {
            console.error(`Error processing ${mediaType} URL:`, err);
            if (mediaType === 'image') {
                setImageSrc(DEFAULT_IMAGE);
                setImageError(true);
            } else {
                setVideoSrc(null);
                setVideoError(true);
            }
        }
    };

    // 尝试多个URL加载图片
    const loadImageWithFallbacks = (urlOptions: string[]) => {
        const currentOption = attemptCount < urlOptions.length ? urlOptions[attemptCount] : null;
        
        if (!currentOption) {
            console.error('All URL options failed, using default image');
            setImageSrc(DEFAULT_IMAGE);
            setImageError(true);
            return;
        }
        
        console.log(`Trying URL option ${attemptCount + 1}/${urlOptions.length}:`, currentOption);
        setImageSrc(currentOption);
    };

    // 尝试多个URL加载视频
    const loadVideoWithFallbacks = (urlOptions: string[]) => {
        const currentOption = attemptCount < urlOptions.length ? urlOptions[attemptCount] : null;
        
        if (!currentOption) {
            console.error('All video URL options failed');
            setVideoSrc(null);
            setVideoError(true);
            return;
        }
        
        console.log(`Trying video URL option ${attemptCount + 1}/${urlOptions.length}:`, currentOption);
        setVideoSrc(currentOption);
    };

    // 图片加载成功处理
    const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        try {
            const img = event.currentTarget;
            console.log('Image loaded successfully:', imageSrc);
            
            // 计算适当尺寸
            const maxWidth = 800;
            const maxHeight = 600;
            let width = img.naturalWidth;
            let height = img.naturalHeight;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                setImageSize({ width, height });
            setImageError(false);
        } catch (err) {
            console.error('Error in image load handler:', err);
        }
    };

    // 图片加载失败处理
    const handleImageError = () => {
        // 如果当前已经是默认图片，不要再尝试，避免无限循环
        if (imageSrc === DEFAULT_IMAGE) return;
        
        console.error('Failed to load image:', imageSrc);
        
        // 尝试下一个URL选项
        const nextAttempt = attemptCount + 1;
        if (nextAttempt < 5) { // 最多尝试5次不同的URL格式
            setAttemptCount(nextAttempt);
            
            // 构建备用URL
            if (nextAttempt === 1) {
                // 如果URL包含/api/uploads/，尝试移除/api
                if (imageSrc && imageSrc.includes('/api/uploads/')) {
                    const altUrl = imageSrc.replace('/api/uploads/', '/uploads/');
                    console.log('Trying URL without /api prefix:', altUrl);
                    setImageSrc(altUrl);
                    return;
                }
                
                // 尝试不带/api的路径
                const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '');
                const fileName = imageSrc && imageSrc.split('/').pop();
                if (fileName) {
                    const altUrl = `${baseUrl}/uploads/${fileName}`;
                    console.log('Trying alternative URL format:', altUrl);
                    setImageSrc(altUrl);
                }
            } else if (nextAttempt === 2) {
                // 尝试直接使用localhost
                const fileName = imageSrc && imageSrc.split('/').pop();
                if (fileName) {
                    const altUrl = `http://localhost:5001/uploads/${fileName}`;
                    console.log('Trying localhost URL:', altUrl);
                    setImageSrc(altUrl);
                }
            } else if (nextAttempt === 3) {
                // 尝试直接使用localhost并加上/api
                const fileName = imageSrc && imageSrc.split('/').pop();
                if (fileName) {
                    const altUrl = `http://localhost:5001/api/uploads/${fileName}`;
                    console.log('Trying localhost API URL:', altUrl);
                    setImageSrc(altUrl);
                }
            } else {
                // 最后尝试原始URL
                console.log('Trying original URL as fallback');
                const originalFixed = memory.preview && memory.preview.replace(/\\/g, '/');
                if (originalFixed) {
                    setImageSrc(originalFixed);
                } else {
                    setImageSrc(DEFAULT_IMAGE);
                    setImageError(true);
                }
            }
        } else {
            // 所有尝试都失败，使用默认图片
            console.error('All image loading attempts failed, using default image');
            setImageSrc(DEFAULT_IMAGE);
            setImageError(true);
        }
    };

    // 视频加载错误处理
    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        console.error('Video error:', e);
        
        // 尝试下一个URL选项
        const nextAttempt = attemptCount + 1;
        if (nextAttempt < 5) { // 最多尝试5次不同的URL格式
            setAttemptCount(nextAttempt);
            
            // 构建备用URL
            if (nextAttempt === 1) {
                // 如果URL包含/api/uploads/，尝试移除/api
                if (videoSrc && videoSrc.includes('/api/uploads/')) {
                    const altUrl = videoSrc.replace('/api/uploads/', '/uploads/');
                    console.log('Trying video URL without /api prefix:', altUrl);
                    setVideoSrc(altUrl);
                    return;
                }
                
                // 尝试不带/api的路径
                const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '');
                const fileName = videoSrc && videoSrc.split('/').pop();
                if (fileName) {
                    const altUrl = `${baseUrl}/uploads/${fileName}`;
                    console.log('Trying alternative video URL format:', altUrl);
                    setVideoSrc(altUrl);
                }
            } else if (nextAttempt === 2) {
                // 尝试直接使用localhost
                const fileName = videoSrc && videoSrc.split('/').pop();
                if (fileName) {
                    const altUrl = `http://localhost:5001/uploads/${fileName}`;
                    console.log('Trying localhost video URL:', altUrl);
                    setVideoSrc(altUrl);
                }
            } else if (nextAttempt === 3) {
                // 尝试直接使用localhost并加上/api
                const fileName = videoSrc && videoSrc.split('/').pop();
                if (fileName) {
                    const altUrl = `http://localhost:5001/api/uploads/${fileName}`;
                    console.log('Trying localhost API video URL:', altUrl);
                    setVideoSrc(altUrl);
                }
            } else {
                // 最后尝试原始URL
                console.log('Trying original video URL as fallback');
                const originalFixed = memory.preview && memory.preview.replace(/\\/g, '/');
                if (originalFixed) {
                    setVideoSrc(originalFixed);
                } else {
                    setVideoSrc(null);
                    setVideoError(true);
                }
            }
        } else {
            // 所有尝试都失败
            console.error('All video loading attempts failed');
            setVideoSrc(null);
            setVideoError(true);
        }
    };

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
                                <p className="text-xs overflow-auto max-w-md">{memory.preview || 'No image URL'}</p>
                                {imageSrc && imageSrc !== DEFAULT_IMAGE && imageSrc !== memory.preview && (
                                    <p className="text-xs overflow-auto max-w-md">Tried: {imageSrc}</p>
                                )}
                                <button 
                                    className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
                                    onClick={() => imageSrc && window.open(imageSrc, '_blank')}
                                    disabled={!imageSrc || imageSrc === DEFAULT_IMAGE}
                                >
                                    打开图片链接
                                </button>
                                <button 
                                    className="mt-2 ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded"
                                    onClick={() => {
                                        setImageError(false);
                                        setAttemptCount(0);
                                        processMediaUrl(memory.preview, 'image');
                                    }}
                                >
                                    重试加载
                                </button>
                            </div>
                        ) : (
                            // 只在imageSrc有值时渲染图片，避免空src警告
                            imageSrc && (
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
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                        />
                            )
                        )}
                    </div>
                );
            case 'video':
                return (
                    <div className="mt-3 flex justify-center">
                        {videoError ? (
                            <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                                <p>无法加载视频</p>
                                <p className="text-xs overflow-auto max-w-md">{memory.preview || '没有视频URL'}</p>
                                {videoSrc && videoSrc !== memory.preview && (
                                    <p className="text-xs overflow-auto max-w-md">尝试过: {videoSrc}</p>
                                )}
                                <button 
                                    className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
                                    onClick={() => videoSrc && window.open(videoSrc, '_blank')}
                                    disabled={!videoSrc}
                                >
                                    打开视频链接
                                </button>
                                <button 
                                    className="mt-2 ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded"
                                    onClick={() => {
                                        setVideoError(false);
                                        setAttemptCount(0);
                                        processMediaUrl(memory.preview, 'video');
                                    }}
                                >
                                    重试加载
                                </button>
                            </div>
                        ) : (
                            videoSrc ? (
                                <video
                                    src={videoSrc}
                                    controls
                                    className="mt-3 w-full h-auto rounded-lg"
                                    onError={handleVideoError}
                                />
                            ) : null
                        )}
                    </div>
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
