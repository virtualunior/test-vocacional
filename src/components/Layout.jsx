import React from 'react';
import UserProfile from "./UserProfile" // Assuming UserProfile exists

export default function Layout({ children, title }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand Area */}
            <div className="flex items-center gap-3">
              <img src="unior-icon.webp" alt="Unior Icon" class="w-8 h-8 rounded-lg"/>
              <div className="hidden sm:block">
                <h2 className="text-sm font-medium text-gray-900">Universidad Privada de Oruro</h2>
                <p className="text-xs text-gray-500">Sistema de Orientación Vocacional</p>
              </div>
            </div>

            {/* User Profile */}
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{title}</h1>
          <div className="w-12 h-1 bg-gradient-to-r from-[#db1f26] to-[#660915] rounded-full"></div>
        </div>

        {/* Page Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[60vh]">
          <div className="p-6 sm:p-8">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            {/* Universidad */}
            <div className="text-gray-600">
              <p className="text-sm font-medium">Universidad Privada de Oruro</p>
              <p className="text-xs text-gray-500">Sistema de Orientación Vocacional</p>
            </div>

            {/* Copyright */}
            <div className="text-gray-500 text-xs">
              <p>&copy; 2025 Todos los derechos reservados</p>
            </div>

            {/* Desarrollador */}
            <div className="text-gray-600 text-right">
              <p className="text-xs text-gray-500">Desarrollado por</p>
              <p className="text-sm font-semibold text-gray-900">NettiDev</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
