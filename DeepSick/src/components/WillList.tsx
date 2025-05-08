// 遗嘱列表组件，显示用户的遗嘱列表，并提供编辑和删除功能。
// src/components/WillList.tsx
import { useRef, useState } from 'react';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface Will {
    _id: string;
    uploaderName: string;
    farewellMessage: string;
    videoFilename: string;
    createdAt?: string;
}

interface Props {
    wills: Will[];
    onDelete: (id: string) => void;
    onUpdate: (id: string, fields: Partial<Will>, videoBlob?: Blob) => void;
}

export default function WillList({ wills, onDelete, onUpdate }: Props) {
    /* ============= 编辑状态 ============= */
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName]   = useState('');
    const [editMsg, setEditMsg]     = useState('');

    /* ============= 重新录制 ============= */
    const [recording, setRecording]         = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const recordedChunks                    = useRef<Blob[]>([]);
    const [previewURL,  setPreviewURL]      = useState('');
    const [previewBlob, setPreviewBlob]     = useState<Blob | null>(null);
    const videoRef                          = useRef<HTMLVideoElement>(null);

    /**
     * 初始化摄像头并返回一个已绑定 ondata/onstop 的 MediaRecorder
     */
    const initCamera = async (): Promise<MediaRecorder> => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }

        const rec = new MediaRecorder(stream);
        rec.ondataavailable = e => {
            if (e.data.size) recordedChunks.current.push(e.data);
        };
        rec.onstop = () => {
            const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
            setPreviewBlob(blob);
            setPreviewURL(URL.createObjectURL(blob));
            recordedChunks.current = [];
        };

        setMediaRecorder(rec);
        return rec;
    };

    /**
     * 开始录制：第一次调用时会 await initCamera 拿到 recorder
     */
    const startRec = async () => {
        recordedChunks.current = [];
        setPreviewBlob(null);
        setPreviewURL('');

        // 如果没有初始化过就先 init，再 start
        const rec = mediaRecorder ?? await initCamera();
        rec.start();
        setMediaRecorder(rec);
        setRecording(true);
    };

    /** 停止录制 */
    const stopRec = () => {
        mediaRecorder?.stop();
        setRecording(false);
    };

    /* ============= 进入 / 退出编辑 ============= */
    const enterEdit = (w: Will) => {
        setEditingId(w._id);
        setEditName(w.uploaderName);
        setEditMsg(w.farewellMessage);
        const videoUrl = `${apiBase}/uploads/${w.videoFilename}`;
        setPreviewURL(videoUrl);
        setPreviewBlob(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setPreviewURL('');
        setPreviewBlob(null);
        // 关闭摄像头流
        (videoRef.current?.srcObject as MediaStream | null)
            ?.getTracks()
            .forEach(t => t.stop());
        setMediaRecorder(null);
    };

    const save = (id: string) => {
        onUpdate(
            id,
            { uploaderName: editName, farewellMessage: editMsg },
            previewBlob || undefined
        );
        cancelEdit();
    };

    /* ============= 渲染 ============= */
    if (!wills.length) {
        return (
            <p className="text-center text-warm-gray mt-6">
                暂无告别留言。
            </p>
        );
    }

    return (
        <section className="space-y-10 mt-12">
            {wills.map(w => (
                <div key={w._id} className="will-card bg-white shadow-md rounded-lg p-6">
                    {editingId === w._id ? (
                        <>
                            {/* 文本输入 */}
                            <input
                                className="w-full border border-warm-border px-3 py-2 rounded mb-3"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                placeholder="你的姓名"
                            />
                            <textarea
                                className="w-full border border-warm-border px-3 py-2 rounded mb-4 h-24"
                                value={editMsg}
                                onChange={e => setEditMsg(e.target.value)}
                                placeholder="告别留言"
                            />

                            {/* 录像与预览 */}
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                {/* 摄像区域 */}
                                <div>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        className="w-full h-40 bg-warm-dark rounded"
                                    />
                                    <div className="text-center mt-2">
                                        {!recording ? (
                                            <button
                                                type="button"
                                                className="btn-primary"
                                                onClick={startRec}
                                            >
                                                开始录制
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn-ghost"
                                                onClick={stopRec}
                                            >
                                                停止录制
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* 预览区域 */}
                                <div>
                                    <label className="block mb-1 font-medium">预览</label>
                                    {previewURL ? (
                                        <video
                                            src={previewURL}
                                            controls
                                            className="w-full h-40 bg-warm-dark rounded"
                                        />
                                    ) : (
                                        <div className="w-full h-40 flex items-center justify-center bg-warm-light text-warm-gray rounded">
                                            暂无录制
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 操作按钮 */}
                            <div className="space-x-3 text-sm">
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={() => save(w._id)}
                                >
                                    保存
                                </button>
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={cancelEdit}
                                >
                                    取消
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* 展示态头部 */}
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-semibold">
                                    {w.uploaderName || '匿名的'}
                                </h3>
                                <div className="space-x-2 text-sm">
                                    <button
                                        className="btn-edit"
                                        onClick={() => enterEdit(w)}
                                    >
                                        编辑
                                    </button>
                                    <button
                                        className="btn-danger"
                                        onClick={() => onDelete(w._id)}
                                    >
                                        删除
                                    </button>
                                </div>
                            </div>

                            {/* 已上传视频 */}
                            {w.videoFilename && (
                                <video
                                    controls
                                    className="w-full max-h-[400px] rounded mb-3"
                                    src={`${apiBase}/uploads/${w.videoFilename}`}
                                />
                            )}

                            {/* 文字留言 */}
                            {w.farewellMessage && (
                                <p className="mb-2 whitespace-pre-line">
                                    {w.farewellMessage}
                                </p>
                            )}

                            {/* 时间戳 */}
                            {w.createdAt && (
                                <p className="text-center text-sm text-gray-500">
                                    {new Date(w.createdAt).toLocaleString('zh-CN')}
                                </p>
                            )}
                        </>
                    )}
                </div>
            ))}
        </section>
    );
}