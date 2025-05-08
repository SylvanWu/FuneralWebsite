import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const nav = useNavigate();

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold">Admin Panel</h2>

      <button
        onClick={() => nav('/profile')}
        className="px-6 py-2 bg-lime-600 text-white rounded hover:bg-lime-700 transition"
      >
        Go to My Profile
      </button>
    </div>
  );
}
