// src/components/WillForm.tsx
import React, { useEffect, useRef, useState } from 'react';
import { createWill } from '../api';

/* ---------------- Types ---------------- */
export interface Will {
    _id: string;
    uploaderName: string;
    farewellMessage: string;
    videoFilename: string;
    createdAt: string;
}
interface Props { onCreated?: (w: Will) => void }

/* ================ Component ================ */
export default function WillForm({ onCreated }: Props) {
    /* ---------- State ---------- */
    const [uploaderName, setUploaderName] = useState('');
    const [farewellMessage, setFarewellMsg] = useState('');
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [previewURL, setPreviewURL] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);

    /* ---------- Open camera ---------- */
    /* Prevent black screen caused by double invocation in React 18 StrictMode */
    const closedRef = useRef(false);          // Ensure stream is closed only once
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
                console.error('Failed to access camera/microphone:', err);
            }
        })();

        /* --------- Cleanup --------- */
        return () => {
            if (!closedRef.current && localStream) {
                localStream.getTracks().forEach(t => t.stop());
                closedRef.current = true;
            }
        };
    }, []);

    /* ---------- Recording control ---------- */
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

    /* ---------- Submit ---------- */
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
            alert('Submitted successfully!');
        } catch (err) {
            console.error('Submission failed:', err);
            alert('Submission failed, please try again later.');
        }
    };

    /* ---------- UI ---------- */
    return (
        <div className="will-panel">
            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Name */}
                <div>
                    <label className="block mb-1 font-medium">Your Name</label>
                    <input
                        value={uploaderName}
                        onChange={e => setUploaderName(e.target.value)}
                        placeholder="Your name (optional)"
                    />
                </div>

                {/* Farewell message */}
                <div>
                    <label className="block mb-1 font-medium">Your Farewell Message</label>
                    <textarea
                        value={farewellMessage}
                        onChange={e => setFarewellMsg(e.target.value)}
                        className="h-28"
                        placeholder="Enter a farewell message"
                    />
                </div>

                {/* Camera + Preview */}
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Live Camera */}
                    <div className="flex flex-col items-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline           /* ★Important */
                            muted
                            className="w-full h-48 rounded object-cover bg-black/40" /* semi-transparent placeholder */
                        />
                        <button
                            type="button"
                            onClick={recording ? stopRec : startRec}
                            className={recording ? 'btn-ghost mt-2' : 'btn-primary mt-2'}
                        >
                            {recording ? 'Stop Recording' : 'Start Recording'}
                        </button>
                    </div>

                    {/* Recorded Video Preview */}
                    <div>
                        <label className="block mb-1 font-medium">Preview Recorded Video</label>
                        {previewURL ? (
                            <video src={previewURL} controls className="w-full h-48 rounded object-cover" />
                        ) : (
                            <div className="w-full h-48 flex items-center justify-center bg-warm-light rounded text-warm-gray">
                                No Recording Yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={!recordedBlob} className="btn-primary w-full text-lg">
                    Submit Farewell Message
                </button>
            </form>
        </div>
    );
}
