// 记忆内容卡片组件，显示记忆内容的上传者、时间和具体内容（图片、视频或文本），并提供删除功能。
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

    /* 进入动画，只在首次挂载时执行一次 */
    useEffect(() => {
        const timer = setTimeout(() => setIsNew(false), 500);
        return () => clearTimeout(timer);
    }, []);

    /* 获取图片尺寸 */
    useEffect(() => {
        if (memory.type === 'image') {
            const img = new Image();
            img.onload = () => {
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
            };
            img.src = memory.preview;
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
                        <img
                            src={memory.preview}
                            alt="Memory"
                            className="rounded-lg"
                            style={{
                                width: imageSize.width,
                                height: imageSize.height,
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                );
            case 'video':
                return (
                    <video
                        src={memory.preview}
                        controls
                        className="mt-3 w-full h-auto rounded-lg"
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
            {/* 头部：头像 + 上传者 + 时间 */}
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

            {/* 主体内容（图 / 视频 / 文本） */}
            {renderContent()}

            {/* 删除按钮，仅在canDelete为true时显示 */}
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