// 遗嘱表单组件，允许用户输入姓名、告别留言，并使用摄像头录制视频，提交后创建新的遗嘱。
// src/components/WillForm.tsx
import React, { useEffect, useRef, useState } from 'react';
import { createWill } from '../api';

/** 后端返回字段，根据需要再补充 */
export interface Will {
    _id: string;
    uploaderName: string;
    farewellMessage: string;
    videoFilename: string;
    createdAt: string;
}

interface Props { onCreated?: (w: Will) => void }

export default function WillForm({ onCreated }: Props) {
    /* ---------------- state ---------------- */
    const [uploaderName, setUploaderName] = useState('');
    const [farewellMessage, setFarewellMsg] = useState('');
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);   // ⭐
    const [previewURL, setPreviewURL] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);

    /* ---------------- init camera ---------------- */
    useEffect(() => {
        (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                videoRef.current!.srcObject = stream;

                const rec = new MediaRecorder(stream);
                rec.ondataavailable = e => e.data.size && recordedChunksRef.current.push(e.data);

                rec.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    setRecordedBlob(blob);                             // ⭐ 保留上传用 blob
                    setPreviewURL(URL.createObjectURL(blob));          // 显示预览
                    recordedChunksRef.current = [];                    // 清缓存无妨
                };
                setMediaRecorder(rec);
            } catch (err) {
                console.error('无法打开摄像头／麦克风：', err);
            }
        })();

        // 组件卸载，关闭摄像头
        return () => {
            (videoRef.current?.srcObject as MediaStream | null)
                ?.getTracks()
                .forEach(t => t.stop());
        };
    }, []);

    /* ---------------- control ---------------- */
    const startRec = () => { recordedChunksRef.current = []; setRecordedBlob(null); setPreviewURL(''); mediaRecorder?.start(); setRecording(true); };
    const stopRec = () => { mediaRecorder?.stop(); setRecording(false); };

    /* ---------------- submit ---------------- */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('uploaderName', uploaderName || 'Anonymous');
        fd.append('farewellMessage', farewellMessage);

        if (recordedBlob) {
            fd.append('video', new File([recordedBlob], 'farewell.webm', { type: 'video/webm' }));
        }

        try {
            const newWill: Will = await createWill(fd);  // 已在 api 封装 .then(res=>res.data)
            onCreated?.(newWill);                        // 通知父组件立即更新列表

            /* reset */
            setUploaderName('');
            setFarewellMsg('');
            setRecordedBlob(null);
            setPreviewURL('');
            alert('提交成功！');
        } catch (err) {
            console.error('提交失败：', err);
            alert('提交失败，请稍后重试');
        }
    };

    /* ---------------- UI ---------------- */
    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* 姓名 */}
            <div>
                <label className="block mb-1">你的姓名</label>
                <input
                    value={uploaderName}
                    onChange={e => setUploaderName(e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder="你的姓名"
                />
            </div>

            {/* 留言 */}
            <div>
                <label className="block mb-1">你的告别留言</label>
                <textarea
                    value={farewellMessage}
                    onChange={e => setFarewellMsg(e.target.value)}
                    className="w-full border p-2 rounded h-28"
                    placeholder="输入文字留言"
                />
            </div>

            {/* 录像与预览 */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* 摄像头 */}
                <div>
                    <video ref={videoRef} autoPlay muted className="w-full h-48 bg-black rounded" />
                    <div className="mt-2 text-center">
                        {!recording ? (
                            <button type="button" onClick={startRec} className="px-4 py-2 bg-red-500 text-white rounded">
                                Start Recording
                            </button>
                        ) : (
                            <button type="button" onClick={stopRec} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">
                                Stop Recording
                            </button>
                        )}
                    </div>
                </div>

                {/* 预览 */}
                <div>
                    <label className="block mb-1">预览已录制视频</label>
                    {previewURL ? (
                        <video src={previewURL} controls className="w-full h-48 bg-black rounded" />
                    ) : (
                        <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded">暂无录制</div>
                    )}
                </div>
            </div>

            <button className="w-full py-2 bg-blue-600 text-white rounded">提交告别留言</button>
        </form>
    );
}