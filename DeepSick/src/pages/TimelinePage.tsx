// src/pages/TimelinePage.tsx
import React, { useState, useEffect } from 'react';
import UploadArea from '../components/UploadArea';
import Timeline, { Memory } from '../components/Timeline';
import {
    fetchMemories,
    createMemory,
    deleteMemory                    // NEW ⬅️ 记得 api 里要有这个函数
} from '../api';

export interface BackendMemory {
    _id: string;
    uploaderName: string;
    uploadTime: string;
    memoryType: 'image' | 'video' | 'text';
    memoryContent: string;
}

export default function TimelinePage() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [name, setName]         = useState('');
    const [isUploading, setUploading] = useState(false);

    /* ---------- 首次加载 ---------- */
    useEffect(() => {
        (async () => {
            try {
                const res  = await fetchMemories();
                const data = res.data ?? res;
                const list = (data as BackendMemory[]).map(m => ({
                    id: m._id,                             // 注意字段映射
                    type: m.memoryType,
                    preview: m.memoryContent,
                    uploadTime: new Date(m.uploadTime),
                    uploaderName: m.uploaderName
                }));
                setMemories(list);
            } catch (err) {
                console.error('Failed to fetch memories:', err);
            }
        })();
    }, []);

    /* ---------- 删除回调（给 Timeline ➜ MemoryCard 用） ---------- */
    const handleDeleteMemory = async (id: string) => {        // NEW
        try {
            await deleteMemory(id);                               // DELETE /api/memories/:id
            setMemories(prev => prev.filter(m => m.id !== id));   // 本地移除
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    /* ---------- 上传 ---------- */
    const handleFileUpload = async (file: File) => {
        if (isUploading) return;
        setUploading(true);
        try {
            let type: Memory['type'] = 'image';
            let preview = '';
            let memoryContent = '';

            if (file.type.startsWith('image/')) {
                type = 'image';
                preview = URL.createObjectURL(file);
                memoryContent = preview;
            } else if (file.type.startsWith('video/')) {
                type = 'video';
                preview = URL.createObjectURL(file);
                memoryContent = preview;
            } else if (file.type === 'text/plain') {
                type = 'text';
                const text = await file.text();
                preview = text.slice(0, 500) + (text.length > 500 ? '…' : '');
                memoryContent = text;
            }

            const fd = new FormData();
            fd.append('file', file);
            fd.append('uploaderName', name || 'Anonymous');
            fd.append('memoryType', type);
            if (type === 'text') fd.append('memoryContent', memoryContent);

            const res = await createMemory(fd);
            const newMemory: Memory = {
                id: res.data._id,
                type,
                preview,
                uploadTime: new Date(),
                uploaderName: name || 'Anonymous'
            };
            setMemories(prev => [newMemory, ...prev]);
        } catch (err) {
            console.error('Failed to upload memory:', err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* 姓名输入 */}
            <label className="block mb-1 text-sm font-medium">Your Name (optional)</label>
            <input
                className="w-full mb-6 px-3 py-2 border rounded"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Please enter your name"
            />

            {/* 上传区域 */}
            <UploadArea onFileUpload={handleFileUpload} />

            {/* 时间线，记得传 onDeleteMemory */}
            <Timeline
                memories={memories}
                onDeleteMemory={handleDeleteMemory}          // NEW ⬅️
            />
        </div>
    );
}