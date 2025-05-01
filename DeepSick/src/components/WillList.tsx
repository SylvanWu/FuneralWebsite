// 遗嘱列表组件，显示用户的遗嘱列表，并提供编辑和删除功能。
// src/components/WillList.tsx
import { useState } from 'react';

export interface Will {
    _id: string;
    uploaderName: string;
    farewellMessage: string;
    videoFilename: string;
    createdAt?: string;
}

interface WillListProps {
    wills: Will[];
    onDelete: (id: string) => void;
    onUpdate: (id: string, fields: Partial<Will>) => void;
}

export default function WillList({ wills, onDelete, onUpdate }: WillListProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editMsg, setEditMsg] = useState('');

    const startEdit = (w: Will) => {
        setEditingId(w._id);
        setEditName(w.uploaderName);
        setEditMsg(w.farewellMessage);
    };

    const saveEdit = (id: string) => {
        onUpdate(id, { uploaderName: editName, farewellMessage: editMsg });
        setEditingId(null);
    };

    if (wills.length === 0) return <p>暂无告别留言。</p>;

    return (
        <section className="space-y-6 mt-8">
            {wills.map(w => (
                <div key={w._id} className="p-4 border rounded bg-white shadow-sm">
                    {editingId === w._id ? (
                        <>
                            <input
                                className="w-full border p-2 mb-2 rounded"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                placeholder="你的姓名"
                            />
                            <textarea
                                className="w-full border p-2 mb-2 rounded"
                                rows={3}
                                value={editMsg}
                                onChange={e => setEditMsg(e.target.value)}
                                placeholder="告别留言"
                            />
                            <div className="space-x-2">
                                <button
                                    onClick={() => saveEdit(w._id)}
                                    className="px-4 py-1 bg-blue-600 text-white rounded"
                                >
                                    保存
                                </button>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="px-4 py-1 bg-gray-300 rounded"
                                >
                                    取消
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="font-semibold">{w.uploaderName}</h3>
                            <p className="whitespace-pre-line mb-2">{w.farewellMessage}</p>
                            {w.videoFilename && (
                                <video
                                    controls
                                    className="w-full max-w-md mb-2"
                                    src={`${import.meta.env.VITE_API_URL}/uploads/${w.videoFilename}`}
                                />
                            )}
                            <div className="space-x-2 text-sm">
                                <button
                                    onClick={() => startEdit(w)}
                                    className="px-3 py-0.5 bg-yellow-500 text-white rounded"
                                >
                                    编辑
                                </button>
                                <button
                                    onClick={() => onDelete(w._id)}
                                    className="px-3 py-0.5 bg-red-600 text-white rounded"
                                >
                                    删除
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </section>
    );
}