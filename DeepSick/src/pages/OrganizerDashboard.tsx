import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrganizerDashboard() {
  const navigate = useNavigate();

  const handleCreateFuneral = () => {
    navigate('/create-funeral');
  };

  const handleExistingFunerals = () => {
    navigate('/existing-funerals');
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Organizer Dashboard</h2>
        <button
          onClick={handleCreateFuneral}
          className="w-full py-2 mb-4 bg-blue-600 text-white rounded-lg font-semibold"
        >
          Create Funeral
        </button>
        <button
          onClick={handleExistingFunerals}
          className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold"
        >
          Existing Funerals
        </button>
      </div>
    </div>
  );
}
