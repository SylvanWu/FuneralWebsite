//遗嘱页面组件，展示用户的遗嘱列表，并提供创建、编辑和删除遗嘱的功能。
// src/pages/WillsPage.tsx
import React, { useEffect, useState } from 'react';
import WillForm, { Will }           from '../components/WillForm';
import WillList                     from '../components/WillList';
import { getWills, deleteWill, updateWill } from '../api';

export default function WillsPage() {
    const [wills,   setWills]   = useState<Will[]>([]);
    const [loading, setLoading] = useState(true);

    /* --------- 初次加载 --------- */
    useEffect(() => {
        (async () => {
            try {
                const result = await getWills();
                setWills(Array.isArray(result) ? result : []);
            } catch (e) {
                console.error('获取遗嘱列表失败', e);
                setWills([]); // 保证 wills 一定是数组
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* --------- 新增回调 --------- */
    const handleCreated = (w:Will) => setWills(prev => [w, ...prev]);

    /* --------- 删除 --------- */
    const handleDelete = async (id:string) => {
        if (!window.confirm('确认删除这条留言？')) return;
        await deleteWill(id);
        setWills(prev => prev.filter(w => w._id !== id));
    };

    /* --------- 更新（文字 / 带新视频） --------- */
    const handleUpdate = async (
        id: string,
        fields: Partial<Will>,
        videoBlob?: Blob,
    ) => {
        try {
            let updated: Will;

            if (videoBlob) {
                /* —— 带新视频 —— */
                const fd = new FormData();
                if (fields.uploaderName   !== undefined) fd.append('uploaderName',   fields.uploaderName);
                if (fields.farewellMessage!== undefined) fd.append('farewellMessage',fields.farewellMessage);
                fd.append('video', new File([videoBlob], 'farewell.webm', { type: 'video/webm' }));

                updated = await updateWill(id, fd, true);          // <― isForm = true
            } else {
                /* —— 纯文字 —— */
                updated = await updateWill(id, fields);
            }

            setWills(prev => prev.map(w => (w._id === id ? updated : w)));
        } catch (err) {
            console.error('更新失败', err);
            window.alert('更新失败，请重试');
        }
    };

    /* --------- 渲染 --------- */
    return (
        <main className="max-w-4xl mx-auto p-6 bg-amber-50">
            <h2 className="text-3xl font-semibold text-center mb-6">
                告别留言与遗嘱
            </h2>

            {/* 新增表单 */}
            <div className="mb-8">
                <WillForm onCreated={handleCreated} />
            </div>

            {/* 列表 / 加载中 */}
            {loading
                ? <p className="text-center py-8 text-gray-600">加载中…</p>
                : <WillList
                    wills={wills}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                />
            }
        </main>
    );
}