// src/components/WillForm.tsx
import React, { useEffect, useRef, useState } from 'react';
import { createWill, getWills, deleteWill, updateWill } from '../api';
import WillList from './WillList';

/* ---------------- Types ---------------- */
export interface Will {
    _id: string;
    uploaderName: string;
    farewellMessage: string;
    videoFilename: string;
    createdAt: string;
}
interface Props {
    onCreated?: (w: Will) => void;
    roomId: string;
}

/* ================ Component ================ */
export default function WillForm({ onCreated, roomId }: Props) {
    console.log('[WillForm] Initialized. Received roomId via prop:', roomId);

    /* ---------- State ---------- */
    const [uploaderName, setUploaderName] = useState('');
    const [farewellMessage, setFarewellMsg] = useState('');
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [previewURL, setPreviewURL] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const [willsList, setWillsList] = useState<Will[]>([]);
    const [loading, setLoading] = useState(false);

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
        
        if (!roomId) {
            alert("Room ID is missing. Cannot submit will.");
            return;
        }

        const fd = new FormData();
        fd.append('uploaderName', uploaderName || 'Anonymous');
        fd.append('farewellMessage', farewellMessage);
        fd.append('roomId', roomId); // Ensure roomId is in FormData
        if (recordedBlob) {
            fd.append('video', new File([recordedBlob], 'farewell.webm', { type: 'video/webm' }));
        }
        try {
            const newWill: Will = await createWill(roomId, fd);
            onCreated?.(newWill);
            // reset
            setUploaderName('');
            setFarewellMsg('');
            setRecordedBlob(null);
            setPreviewURL('');
            
            // Automatically refresh list after successful creation
            fetchWills();
            
            alert('Submission successful!');
        } catch (err: any) {
            // Core error handling
            console.error('Submission failed:', err);
            
            const statusCode = err.response?.status || 'unknown';
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
            
            let userFriendlyMessage = `Submission failed (${statusCode}): ${errorMessage}`;
            
            // Provide more useful information for specific errors
            if (statusCode === 403) {
                userFriendlyMessage = "Insufficient permissions. You may need to login as an organizer or re-verify the room password.";
            } else if (statusCode === 401) {
                userFriendlyMessage = "Your login has expired. Please login again and try once more.";
            }
            
            alert(userFriendlyMessage);
        }
    };

    /* Get will list for this room */
    const fetchWills = async () => {
        if (!roomId) {
            return;
        }
        
        setLoading(true);
        try {
            const wills = await getWills(roomId);
            setWillsList(wills);
        } catch (err) {
            console.error('Failed to fetch list:', err);
            alert('Failed to fetch list. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Delete a will record
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
            return;
        }
        
        setLoading(true);
        try {
            console.log('[WillForm] Deleting will:', id);
            await deleteWill(id);
            console.log('[WillForm] Will deleted successfully');
            
            // Refresh list
            fetchWills();
            
        } catch (err) {
            console.error('[WillForm] Failed to delete will:', err);
            alert('Delete failed. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Update a will record
    const handleUpdate = async (
        id: string, 
        fields: Partial<Will>, 
        videoBlob?: Blob
    ) => {
        setLoading(true);
        try {
            console.log('[WillForm] Updating will:', id, 'with fields:', fields);
            
            if (videoBlob) {
                console.log('[WillForm] Including new video in update, size:', videoBlob.size);
                // Use FormData to upload files
                const fd = new FormData();
                
                if (fields.uploaderName) {
                    fd.append('uploaderName', fields.uploaderName);
                }
                
                if (fields.farewellMessage) {
                    fd.append('farewellMessage', fields.farewellMessage);
                }
                
                fd.append('video', new File([videoBlob], 'farewell.webm', { type: 'video/webm' }));
                
                await updateWill(id, fd, true);
            } else {
                // No video, directly update text fields
                await updateWill(id, fields);
            }
            
            console.log('[WillForm] Will updated successfully');
            
            // Refresh list
            fetchWills();
            
        } catch (err) {
            console.error('[WillForm] Failed to update will:', err);
            alert('Update failed. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    
    // Initialize list on load and set up auto-refresh
    useEffect(() => {
        if (roomId) {
            // Initial load
            fetchWills();
            
            // Set up auto-refresh every 30 seconds
            const refreshInterval = setInterval(() => {
                // Auto-refresh list
                fetchWills();
            }, 30000); // 30 seconds
            
            // Clean up timer
            return () => {
                clearInterval(refreshInterval);
            };
        }
    }, [roomId]); // Only reset when roomId changes

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

            {/* Farewell Messages List */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Saved Farewell Messages</h3>
                    <button 
                        type="button" 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={fetchWills}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Refresh List'}
                    </button>
                </div>

                {/* Using the complete WillList component */}
                {willsList.length > 0 ? (
                    <WillList 
                        wills={willsList} 
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                    />
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded">
                        <p className="text-gray-500">No farewell messages yet</p>
                        <button 
                            className="mt-2 text-blue-500 hover:underline"
                            onClick={fetchWills}
                        >
                            Click to refresh
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
