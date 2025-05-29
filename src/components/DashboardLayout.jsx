// src/components/DashboardLayout.jsx
import React from 'react';
import UserProfile from './UserProfile'; // Import UserProfile

export default function DashboardLayout({ children, title }) {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#db1f26] to-[#660915] text-white">
      {/* Header Area */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">{title}</h1>
        <UserProfile /> {/* User Profile with potential dropdown */}
      </div>

      {/* Main Content Area (passed as children) */}
      <div className="w-full max-w-4xl bg-white bg-opacity-10 rounded-lg shadow-xl p-6 sm:p-8 flex flex-col gap-6 text-gray-800">
        {children}
      </div>
    </div>
  );
}