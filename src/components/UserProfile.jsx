// src/components/UserProfile.jsx
import { auth } from "../firebase"
import { useNavigate } from "react-router-dom"
import { logout } from "../firebase"
import { useState, useRef, useEffect } from "react" // Import useState, useRef, useEffect
import { FaUserCircle, FaSignOutAlt, FaTachometerAlt } from "react-icons/fa" // Import icons

export default function UserProfile() {
  const user = auth.currentUser
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false) // State to manage dropdown visibility
  const dropdownRef = useRef(null) // Ref for clicking outside

  // Effect to close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef])

  const handleLogout = async () => {
    try {
      await logout()
      setIsOpen(false) // Close dropdown after logout attempt
      // Asegurarnos de que la navegación ocurra DESPUÉS del logout exitoso
      navigate("/auth", { replace: true }) // Usar replace: true para evitar volver atrás con el botón de navegación
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleDashboard = () => {
    navigate("/dashboard")
    setIsOpen(false) // Close dropdown after navigation
  }

  if (!user) return null // Don't render if no user is found

  return (
    <div className="relative" ref={dropdownRef}>
      {" "}
      {/* Add relative positioning for dropdown, and ref */}
      <button
        onClick={() => setIsOpen(!isOpen)} // Toggle dropdown on click
        className="flex items-center gap-2 text-gray-700 hover:text-gray-200 transition-colors focus:outline-none"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL || "/placeholder.svg"}
            alt="User"
            className="w-8 h-8 rounded-full border-2 border-white object-cover"
          />
        ) : (
          <FaUserCircle className="w-8 h-8 text-white" /> // Generic icon if no photo
        )}
        <span className="text-sm font-medium hidden sm:block">{user.displayName || user.email}</span>{" "}
        {/* Hidden on small screens */}
      </button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
          {/* Dashboard Button */}
          <button
            onClick={handleDashboard}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
          >
            <FaTachometerAlt className="text-lg" />
            Dashboard
          </button>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
          >
            <FaSignOutAlt className="text-lg" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
