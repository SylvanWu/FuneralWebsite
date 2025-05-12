import React, { useState } from 'react';

export default function VisitorHome() {
  // Assume you have userType for checking
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isVisitor = user.userType === 'visitor';

  // Control whether the room is verified
  const [verified, setVerified] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [roomPwd, setRoomPwd] = useState('');
  const [error, setError] = useState('');

  // Simple front-end verification
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !roomPwd.trim()) {
      setError('Room ID and Password are required');
      return;
    }
    // Replace with real API verification
    if (roomId === roomPwd) {
      setVerified(true);
      setError('');
    } else {
      setError('Room ID or Password incorrect');
    }
  };

  // Show verification form if visitor and not verified
  if (isVisitor && !verified) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Enter Room</h2>
          {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Room ID"
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
            />
            <input
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Password"
              type="password"
              value={roomPwd}
              onChange={e => setRoomPwd(e.target.value)}
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show main page directly if visitor is verified or user is organizer
  return (
    <div>
      {/* This is your original home page content */}
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Digital Memorial Hall</h1>
          <h2 className="text-2xl font-semibold mb-8 text-gray-600">Remember and Honor</h2>
          <div className="flex justify-center">
            <img src="/your-image.png" alt="RIP" style={{ width: 400, height: 300 }} />
          </div>
          <div className="flex justify-center mt-8 gap-4">
            <button className="px-6 py-2 bg-gray-200 rounded-lg">Interactive</button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">Enter Memorial Hall</button>
          </div>
        </div>
      </div>
    </div>
  );
}
