// src/components/WillForm.tsx
import React, { useEffect, useRef, useState } from 'react';
import { createWill } from '../api';

/* ---------------- 类型 ---------------- */
export interface Will {
    _id: string;
    uploaderName: string;
    farewellMessage: string;
    videoFilename: string;
    createdAt: string;
}
interface Props { onCreated?: (w: Will) => void }

/* ================ 组件 ================ */
export default function WillForm({ onCreated }: Props) {
    /* ---------- 状态 ---------- */
    const [uploaderName, setUploaderName] = useState('');
    const [farewellMessage, setFarewellMsg] = useState('');
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [previewURL, setPreviewURL] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);

    /* ---------- 打开摄像头 ---------- */
    /* 解决 React18‑StrictMode 下 effect 双调导致黑屏 */
    const closedRef = useRef(false);          // 只关一次
    useEffect(() => {
        let localStream: MediaStream;

        (async () => {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                if (videoRef.current) videoRef.current.srcObject = localStream;

                const rec = new MediaRecorder(localStream);
                rec.ondataavailable = e => {
                    if (e.data.size) recordedChunksRef.current.push(e.data);
                };
                rec.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    setRecordedBlob(blob);
                    setPreviewURL(URL.createObjectURL(blob));
                    recordedChunksRef.current = [];
                };
                setMediaRecorder(rec);
            } catch (err) {
                console.error('无法打开摄像头/麦克风：', err);
            }
        })();

        /* --------- 清理 --------- */
        return () => {
            if (!closedRef.current && localStream) {
                localStream.getTracks().forEach(t => t.stop());
                closedRef.current = true;
            }
        };
    }, []);

    /* ---------- 录制控制 ---------- */
    const startRec = () => {
        recordedChunksRef.current = [];
        setRecordedBlob(null);
        setPreviewURL('');
        mediaRecorder?.start();
        setRecording(true);
    };
    const stopRec = () => {
        mediaRecorder?.stop();
        setRecording(false);
    };

    /* ---------- 提交 ---------- */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('uploaderName', uploaderName || 'Anonymous');
        fd.append('farewellMessage', farewellMessage);
        if (recordedBlob) {
            fd.append('video', new File([recordedBlob], 'farewell.webm', { type: 'video/webm' }));
        }
        try {
            const newWill: Will = await createWill(fd);
            onCreated?.(newWill);
            // reset
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

    /* ---------- UI ---------- */
    return (
        <div className="will-panel">
            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* 姓名 */}
                <div>
                    <label className="block mb-1 font-medium">你的姓名</label>
                    <input
                        value={uploaderName}
                        onChange={e => setUploaderName(e.target.value)}
                        placeholder="你的姓名（可选）"
                    />
                </div>

                {/* 留言 */}
                <div>
                    <label className="block mb-1 font-medium">你的告别留言</label>
                    <textarea
                        value={farewellMessage}
                        onChange={e => setFarewellMsg(e.target.value)}
                        className="h-28"
                        placeholder="输入文字留言"
                    />
                </div>

                {/* 摄像头 + 预览 */}
                <div className="grid md:grid-cols-2 gap-4">
                    {/* 摄像头实时 */}
                    <div className="flex flex-col items-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline           /* ★关键 */
                            muted
                            className="w-full h-48 rounded object-cover bg-black/40" /* 半透明占位 */
                        />
                        <button
                            type="button"
                            onClick={recording ? stopRec : startRec}
                            className={recording ? 'btn-ghost mt-2' : 'btn-primary mt-2'}
                        >
                            {recording ? '停止录制' : '开始录制'}
                        </button>
                    </div>

                    {/* 录制结果预览 */}
                    <div>
                        <label className="block mb-1 font-medium">预览已录制视频</label>
                        {previewURL ? (
                            <video src={previewURL} controls className="w-full h-48 rounded object-cover" />
                        ) : (
                            <div className="w-full h-48 flex items-center justify-center bg-warm-light rounded text-warm-gray">
                                暂无录制
                            </div>
                        )}
                    </div>
                </div>

                {/* 提交 */}
                <button type="submit" disabled={!recordedBlob} className="btn-primary w-full text-lg">
                    提交告别留言
                </button>
            </form>
        </div>
    );
}