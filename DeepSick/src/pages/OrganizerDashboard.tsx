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
    <div
    className="w-full min-h-screen flex flex-col items-center justify-center"
    style={{
      backgroundImage: "url('/OrganizerDashboard.png')",
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}
  >
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-transparent">
            <div className="w-full md:w-1/2 bg-white/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-10 transition-all duration-300 ease-in-out" 
           style={{ maxWidth: '550px', minWidth: '320px',backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(16px)',                   
            WebkitBackdropFilter: 'blur(16px)',            
            borderRadius: '16px',                            
            overflow: 'hidden',                              
           }}>
        <h2 className="text-2xl font-bold mb-6">Organizer Dashboard</h2>
        <button
          onClick={handleCreateFuneral}
          className="w-full py-2 mb-4 bg-blue-600 text-white rounded-lg font-semibold"
          style={{ backgroundColor: 'rgba(54, 53, 53, 0.5)'}}
        >
          Create Funeral
        </button>
        <button
          onClick={handleExistingFunerals}
          className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold"
          style={{ backgroundColor: 'rgba(54, 53, 53, 0.5)'}}
        >
          Existing Funerals
        </button>
      </div>
    </div>
    </div>
  );
}
