// Timeline page component: displays memory timeline and provides file upload functionality.
// src/pages/TimelinePage.tsx
import React, { useState, useEffect } from 'react';
import UploadArea from '../components/UploadArea';
import Timeline, { Memory } from '../components/Timeline';
import {
    fetchMemories,
    createMemory,
    deleteMemory                    // NEW ⬅️ Make sure this function exists in your API file
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
    const [name, setName] = useState('');
    const [isUploading, setUploading] = useState(false);
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

    /* ---------- Initial load ---------- */
    useEffect(() => {
        (async () => {
            try {
                const res = await fetchMemories();
                const data = res.data ?? res;
                const list = (data as BackendMemory[]).map(m => ({
                    id: m._id,                             // Note the field mapping
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

    /* ---------- Delete callback (used in Timeline ➜ MemoryCard) ---------- */
    const handleDeleteMemory = async (id: string) => {        // NEW
        try {
            await deleteMemory(id);                               // DELETE /api/memories/:id
            setMemories(prev => prev.filter(m => m.id !== id));   // Remove locally
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    /* ---------- Upload ---------- */
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

    // 检查是否是管理员
    const isOrganizer = userRole === 'organizer';

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Name input */}
            <label className="block mb-1 text-sm font-medium">Your Name (optional)</label>
            <input
                className="w-full mb-6 px-3 py-2 border rounded"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Please enter your name"
            />

            {/* Upload area */}
            <UploadArea onFileUpload={handleFileUpload} isUploading={isUploading} />

            {/* Timeline, remember to pass onDeleteMemory */}
            <Timeline
                memories={memories}
                onDeleteMemory={handleDeleteMemory}
                canDelete={isOrganizer} // 仅在用户是organizer时允许删除
            />
        </div>
    );
}
