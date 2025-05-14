/* ---------- Wills ---------- */
export const getWills = (roomId: string) => API.get(`/wills?roomId=${roomId}`).then(r => r.data);
export const createWill = (roomId: string, fd: FormData) => {
    fd.append('roomId', roomId); 
    return API.post('/wills', fd, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // Longer timeout for video uploads
    })
    .then(r => r.data)
    .catch(error => {
        console.error('Will creation error:', error.response || error);
        throw error;
    });
};
export const deleteWill = (id: string) => API.delete(`/wills/${id}`); 