import React, { useState } from 'react';
import { registerUser } from '../api';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');   // Phone / Email
  const [password, setPwd] = useState('');
  const [role, setRole] = useState<'visitor'|'organizer'|'admin'>('visitor');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser({ username: name, password, role, contact });
      setSuccess(true);
      setTimeout(() => nav('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-login.JPG')" }}
    >
      <div className="w-full max-w-md bg-white/70 backdrop-blur rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Register</h1>

        {error && <p className="mb-4 text-red-600">{error}</p>}
        {success && <p className="mb-4 text-green-600">Success! Redirecting…</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full px-3 py-2 border rounded placeholder-gray-500/80"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Name"
          />

          <input
            className="w-full px-3 py-2 border rounded placeholder-gray-500/80"
            value={contact}
            onChange={e => setContact(e.target.value)}
            required
            placeholder="Phone Number / Email"
          />

          <input
            type="password"
            className="w-full px-3 py-2 border rounded placeholder-gray-500/80"
            value={password}
            onChange={e => setPwd(e.target.value)}
            required
            placeholder="Password"
          />

          <div>
            <label className="block mb-2 text-sm text-center">Select Role</label>
            <div className="flex flex-col items-center gap-2">
              {[
                { label: 'Visitor',   value: 'visitor' },
                { label: 'Organizer', value: 'organizer' },
                { label: 'Admin',     value: 'admin' },
              ].map(({ label, value }) => (
                <label key={value} className="grid grid-cols-[auto_1fr] items-center w-48">
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={role === value}
                    onChange={() => setRole(value as any)}
                    className="justify-self-start"
                  />
                  <span className="justify-self-center w-full text-center">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-lime-500 hover:bg-lime-600 text-white rounded transition"
          >
            Register
          </button>
        </form>
      </div>
    </main>
  );
}
