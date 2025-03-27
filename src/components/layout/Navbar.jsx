"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const Navbar = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">
            UniShare
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-200">
              Home
            </Link>
            <Link to="/leaderboard" className="hover:text-blue-200">
              Leaderboard
            </Link>

            {currentUser ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200">
                  Dashboard
                </Link>
                <Link to="/upload" className="hover:text-blue-200">
                  Upload
                </Link>
                <Link to="/bookmarks" className="hover:text-blue-200">
                  Bookmarks
                </Link>
                <Link to="/study-groups" className="hover:text-blue-200">
                  Study Groups
                </Link>
                <div className="relative group">
                  <button className="flex items-center hover:text-blue-200">
                    <span className="mr-1">{currentUser.name}</span>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white">
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">
                  Login
                </Link>
                <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <Link to="/" className="block py-2 hover:text-blue-200">
              Home
            </Link>
            <Link to="/leaderboard" className="block py-2 hover:text-blue-200">
              Leaderboard
            </Link>

            {currentUser ? (
              <>
                <Link to="/dashboard" className="block py-2 hover:text-blue-200">
                  Dashboard
                </Link>
                <Link to="/upload" className="block py-2 hover:text-blue-200">
                  Upload
                </Link>
                <Link to="/bookmarks" className="block py-2 hover:text-blue-200">
                  Bookmarks
                </Link>
                <Link to="/study-groups" className="block py-2 hover:text-blue-200">
                  Study Groups
                </Link>
                <Link to="/profile" className="block py-2 hover:text-blue-200">
                  Profile
                </Link>
                <button onClick={handleLogout} className="block py-2 hover:text-blue-200 w-full text-left">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 hover:text-blue-200">
                  Login
                </Link>
                <Link to="/register" className="block py-2 hover:text-blue-200">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

