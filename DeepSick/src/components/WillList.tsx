// Will list component, displays the list of user's wills and provides edit and delete functions.
// src/components/WillList.tsx
import { useRef, useState } from 'react';

// Set different baseURL based on environment
const getBaseURL = () => {
  // Check if in development environment
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
  } else {
    // Production environment, use same domain but keep port consistent
    return `${window.location.protocol}//${host}:5001`;
  }
};

const apiBase = getBaseURL();
console.log('WillList using API baseURL:', apiBase);

export interface Will {
    _id: string;
    uploaderName: string;
    farewellMessage: string;
    videoFilename: string;
    createdAt?: string;
}

interface Props {
    wills: Will[];
    onDelete?: (id: string) => void | Promise<void>;
    onUpdate?: (id: string, fields: Partial<Will>, videoBlob?: Blob) => void | Promise<void>;
}

export default function WillList({ wills, onDelete, onUpdate }: Props) {
    /* ============= Edit state ============= */
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName]   = useState('');
    const [editMsg, setEditMsg]     = useState('');

    /* ============= Re-recording ============= */
    const [recording, setRecording]         = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const recordedChunks                    = useRef<Blob[]>([]);
    const [previewURL,  setPreviewURL]      = useState('');
    const [previewBlob, setPreviewBlob]     = useState<Blob | null>(null);
    const videoRef                          = useRef<HTMLVideoElement>(null);

    /**
     * Initialize the camera and return a MediaRecorder with bound ondata/onstop
     */
    const initCamera = async (): Promise<MediaRecorder> => {
        console.log('[WillList] Initializing camera...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            console.log('[WillList] Camera access successful');
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const rec = new MediaRecorder(stream);
            rec.ondataavailable = e => {
                console.log('[WillList] Recording data available, size:', e.data.size);
                if (e.data.size) recordedChunks.current.push(e.data);
            };
            rec.onstop = () => {
                console.log('[WillList] Recording stopped, creating video Blob');
                const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
                console.log('[WillList] Blob created successfully, size:', blob.size);
                setPreviewBlob(blob);
                setPreviewURL(URL.createObjectURL(blob));
                recordedChunks.current = [];
            };

            setMediaRecorder(rec);
            return rec;
        } catch (err) {
            console.error('[WillList] Failed to initialize camera:', err);
            alert('Cannot access camera/microphone. Please ensure you have granted permission and the devices are working properly.');
            throw err;
        }
    };

    /**
     * Start recording: the first time it will await initCamera
     */
    const startRec = async () => {
        console.log('[WillList] Starting recording...');
        recordedChunks.current = [];
        setPreviewBlob(null);
        setPreviewURL('');

        try {
            const rec = mediaRecorder ?? await initCamera();
            rec.start();
            console.log('[WillList] Recording started');
            setMediaRecorder(rec);
            setRecording(true);
        } catch (err) {
            console.error('[WillList] Failed to start recording:', err);
            alert('Cannot start recording. Please check camera permissions.');
        }
    };

    /** Stop recording */
    const stopRec = () => {
        console.log('[WillList] Stopping recording');
        mediaRecorder?.stop();
        setRecording(false);
    };

    /* ============= Enter / Exit edit mode ============= */
    const enterEdit = (w: Will) => {
        console.log('[WillList] Entering edit mode, will ID:', w._id);
        setEditingId(w._id);
        setEditName(w.uploaderName);
        setEditMsg(w.farewellMessage);
        const videoUrl = `${apiBase}/uploads/${w.videoFilename}`;
        console.log('[WillList] Setting video preview URL:', videoUrl);
        setPreviewURL(videoUrl);
        setPreviewBlob(null);
    };

    const cancelEdit = () => {
        console.log('[WillList] Canceling edit');
        setEditingId(null);
        setPreviewURL('');
        setPreviewBlob(null);
        // Close camera stream
        const stream = videoRef.current?.srcObject as MediaStream | null;
        if (stream) {
            console.log('[WillList] Closing camera stream');
            stream.getTracks().forEach(t => t.stop());
        }
        setMediaRecorder(null);
    };

    const save = async (id: string) => {
        console.log('[WillList] Saving edit, will ID:', id);
        console.log('[WillList] Edit data:', {
            name: editName,
            message: editMsg,
            hasNewVideo: !!previewBlob,
            videoBlobSize: previewBlob?.size || 0
        });
        
        try {
            await onUpdate?.(
                id,
                { uploaderName: editName, farewellMessage: editMsg },
                previewBlob || undefined
            );
            console.log('[WillList] Save successful');
            cancelEdit();
        } catch (err) {
            console.error('[WillList] Save failed:', err);
            alert('Save failed, please try again later');
        }
    };

    /* ============= Render ============= */
    if (!Array.isArray(wills) || !wills.length) {
        return (
            <p className="text-center text-warm-gray mt-6">
                No farewell messages yet.
            </p>
        );
    }

    return (
        <section className="space-y-10 mt-12">
            {wills.map(w => (
                <div key={w._id} className="will-card bg-white shadow-md rounded-lg p-6">
                    {editingId === w._id ? (
                        <>
                            {/* Text input */}
                            <input
                                className="w-full border border-warm-border px-3 py-2 rounded mb-3"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                placeholder="Your name"
                            />
                            <textarea
                                className="w-full border border-warm-border px-3 py-2 rounded mb-4 h-24"
                                value={editMsg}
                                onChange={e => setEditMsg(e.target.value)}
                                placeholder="Farewell message"
                            />

                            {/* Recording and preview */}
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                {/* Camera area */}
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
                                                Start Recording
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn-ghost"
                                                onClick={stopRec}
                                            >
                                                Stop Recording
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Preview area */}
                                <div>
                                    <label className="block mb-1 font-medium">Preview</label>
                                    {previewURL ? (
                                        <video
                                            src={previewURL}
                                            controls
                                            className="w-full h-40 bg-warm-dark rounded"
                                        />
                                    ) : (
                                        <div className="w-full h-40 flex items-center justify-center bg-warm-light text-warm-gray rounded">
                                            No recording yet
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="space-x-3 text-sm">
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={() => save(w._id)}
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={cancelEdit}
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Header in display mode */}
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-semibold">
                                    {w.uploaderName || 'Anonymous'}
                                </h3>
                                <div className="space-x-2 text-sm">
                                    {onUpdate && (
                                        <button
                                            className="btn-edit"
                                            onClick={() => enterEdit(w)}
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            className="btn-danger"
                                            onClick={() => onDelete(w._id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Uploaded video */}
                            {w.videoFilename && (
                                <video
                                    controls
                                    className="w-full max-h-[400px] rounded mb-3"
                                    src={`${apiBase}/uploads/${w.videoFilename}`}
                                />
                            )}

                            {/* Text message */}
                            {w.farewellMessage && (
                                <p className="mb-2 whitespace-pre-line">
                                    {w.farewellMessage}
                                </p>
                            )}

                            {/* Timestamp */}
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
