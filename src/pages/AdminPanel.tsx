import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToMain = () => {
    console.log('🏠 Navigating back to main Aviation Bay site');
    navigate('/');
  };

  const handleLogout = () => {
    console.log('🚪 Logging out from aviation admin panel');
    localStorage.removeItem('aviation-bay-admin-auth');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Panel Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Back button and title */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToMain}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                title="Back to Aviation Bay"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Aviation Bay</span>
                <span className="sm:hidden">Back</span>
              </button>

              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-bold text-gray-900">Aviation Bay Admin Panel</h1>
                <p className="text-sm text-gray-500">Manage and review jet spotting data submissions</p>
              </div>
            </div>

            {/* Right side - Logout button */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Aviation Admin</p>
                <p className="text-xs text-gray-500">Platform Moderator</p>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Summary (replace with real data logic as needed) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">
          Platform Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center">
            <span className="text-2xl font-bold text-blue-700">128</span>
            <span className="text-sm text-gray-500 mt-1">Jets Identified</span>
          </div>
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center">
            <span className="text-2xl font-bold text-green-700">112</span>
            <span className="text-sm text-gray-500 mt-1">Unique Locations</span>
          </div>
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center">
            <span className="text-2xl font-bold text-yellow-700">44</span>
            <span className="text-sm text-gray-500 mt-1">Active Spotters</span>
          </div>
        </div>
        {/* You can expand these blocks to fetch and show live stats from your database */}
      </div>
    </div>
  );
};

export default AdminPanel;
