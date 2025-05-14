// Will page component, displays the user's list of wills and provides create, edit, and delete functionality.
// src/pages/WillsPage.tsx
import React, { useEffect, useState } from 'react';
import WillForm, { Will }           from '../components/WillForm';
import WillList                     from '../components/WillList';
import { getWills, deleteWill, updateWill } from '../api';

export default function WillsPage() {
    const [wills,   setWills]   = useState<Will[]>([]);
    const [loading, setLoading] = useState(true);

    /* --------- Initial load --------- */
    useEffect(() => {
        (async () => {
            try {
                const result = await getWills("default");
                setWills(Array.isArray(result) ? result : []);
            } catch (e) {
                console.error('Failed to fetch wills list', e);
                setWills([]); // Ensure wills is always an array
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* --------- Callback after creation --------- */
    const handleCreated = (w:Will) => setWills(prev => [w, ...prev]);

    /* --------- Delete --------- */
    const handleDelete = async (id:string) => {
        if (!window.confirm('Are you sure you want to delete this will?')) return;
        await deleteWill(id);
        setWills(prev => prev.filter(w => w._id !== id));
    };

    /* --------- Update (text / with new video) --------- */
    const handleUpdate = async (
        id: string,
        fields: Partial<Will>,
        videoBlob?: Blob,
    ) => {
        try {
            let updated: Will;

            if (videoBlob) {
                /* —— With new video —— */
                const fd = new FormData();
                if (fields.uploaderName   !== undefined) fd.append('uploaderName',   fields.uploaderName);
                if (fields.farewellMessage!== undefined) fd.append('farewellMessage',fields.farewellMessage);
                fd.append('video', new File([videoBlob], 'farewell.webm', { type: 'video/webm' }));

                updated = await updateWill(id, fd, true);          // <― isForm = true
            } else {
                /* —— Text only —— */
                updated = await updateWill(id, fields);
            }

            setWills(prev => prev.map(w => (w._id === id ? updated : w)));
        } catch (err) {
            console.error('Update failed', err);
            window.alert('Update failed. Please try again.');
        }
    };

    /* --------- Render --------- */
    return (
        <main className="max-w-4xl mx-auto p-6 bg-amber-50">
            <h2 className="text-3xl font-semibold text-center mb-6">
                Farewell Messages and Wills
            </h2>

            {/* Create form */}
            <div className="mb-8">
                <WillForm onCreated={handleCreated} roomId="default" />
            </div>

            {/* List / Loading */}
            {loading
                ? <p className="text-center py-8 text-gray-600">Loading…</p>
                : <WillList
                    wills={wills}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                />
            }
        </main>
    );
}
