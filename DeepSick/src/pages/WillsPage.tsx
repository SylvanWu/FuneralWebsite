//遗嘱页面组件，展示用户的遗嘱列表，并提供创建、编辑和删除遗嘱的功能。
// src/pages/WillsPage.tsx
import React, { useEffect, useState } from 'react';
import WillForm, { Will } from '../components/WillForm';
import WillList from '../components/WillList';
import { getWills, deleteWill, updateWill } from '../api';

export default function WillsPage() {
    const [wills, setWills] = useState<Will[]>([]);
    const [loading, setLoading] = useState(true);

    // 首次加载
    useEffect(() => {
        (async () => {
            try {
                const list = await getWills();
                setWills(list);
            } catch (err) {
                console.error('获取遗嘱列表失败', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // 表单新增
    const handleCreated = (w: Will) => setWills(prev => [w, ...prev]);

    // 删除
    const handleDelete = async (id: string) => {
        try {
            await deleteWill(id);
            setWills(prev => prev.filter(w => w._id !== id));
        } catch (err) {
            console.error('删除失败', err);
        }
    };

    // 编辑
    const handleUpdate = async (id: string, fields: Partial<Will>) => {
        try {
            const updated = await updateWill(id, fields);
            setWills(prev => prev.map(w => (w._id === id ? updated : w)));
        } catch (err) {
            console.error('更新失败', err);
        }
    };

    return (
        <main className="max-w-4xl mx-auto p-4">
            <h2 className="text-3xl font-semibold mb-6">告别留言与遗嘱</h2>

            <WillForm onCreated={handleCreated} />

            {loading ? (
                <p className="text-gray-500 mt-8">加载中…</p>
            ) : (
                <WillList wills={wills} onDelete={handleDelete} onUpdate={handleUpdate} />
            )}
        </main>
    );
}