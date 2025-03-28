"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import ThemeToggle from "./ThemeToggle"
import {
  FiHome,
  FiAward,
  FiGrid,
  FiUpload,
  FiBookmark,
  FiUsers,
  FiLogIn,
  FiUserPlus,
  FiUser,
  FiLogOut,
} from "react-icons/fi"

const Navbar = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-800 dark:to-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <span className="bg-white text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mr-2">
              Uni
            </span>
            <span>Share</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-200 flex items-center gap-1">
              <FiHome /> Home
            </Link>
            <Link to="/leaderboard" className="hover:text-blue-200 flex items-center gap-1">
              <FiAward /> Leaderboard
            </Link>

            {currentUser ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200 flex items-center gap-1">
                  <FiGrid /> Dashboard
                </Link>
                <Link to="/upload" className="hover:text-blue-200 flex items-center gap-1">
                  <FiUpload /> Upload
                </Link>
                <Link to="/bookmarks" className="hover:text-blue-200 flex items-center gap-1">
                  <FiBookmark /> Bookmarks
                </Link>
                <Link to="/study-groups" className="hover:text-blue-200 flex items-center gap-1">
                  <FiUsers /> Study Groups
                </Link>
                <ThemeToggle />
                <div className="relative group">
                  <button className="flex items-center hover:text-blue-200">
                    <span className="mr-1">{currentUser.name}</span>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white flex items-center gap-2"
                    >
                      <FiUser /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-800 dark:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white flex items-center gap-2"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 flex items-center gap-1">
                  <FiLogIn /> Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-md font-semibold hover:bg-blue-100 border border-white flex items-center gap-1"
                >
                  <FiUserPlus className="text-blue-600" />{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Sign Up
                  </span>
                </Link>
                <ThemeToggle />
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <button className="ml-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <Link to="/" className="block py-2 hover:text-blue-200 flex items-center gap-2">
              <FiHome /> Home
            </Link>
            <Link to="/leaderboard" className="block py-2 hover:text-blue-200 flex items-center gap-2">
              <FiAward /> Leaderboard
            </Link>

            {currentUser ? (
              <>
                <Link to="/dashboard" className="block py-2 hover:text-blue-200 flex items-center gap-2">
                  <FiGrid /> Dashboard
                </Link>
                <Link to="/upload" className="block py-2 hover:text-blue-200 flex items-center gap-2">
                  <FiUpload /> Upload
                </Link>
                <Link to="/bookmarks" className="block py-2 hover:text-blue-200 flex items-center gap-2">
                  <FiBookmark /> Bookmarks
                </Link>
                <Link to="/study-groups" className="block py-2 hover:text-blue-200 flex items-center gap-2">
                  <FiUsers /> Study Groups
                </Link>
                <Link to="/profile" className="block py-2 hover:text-blue-200 flex items-center gap-2">
                  <FiUser /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block py-2 hover:text-blue-200 w-full text-left flex items-center gap-2"
                >
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 hover:text-blue-200 flex items-center gap-2">
                  <FiLogIn /> Login
                </Link>
                <Link to="/register" className="block py-2 hover:text-blue-200 flex items-center gap-2">
                  <FiUserPlus /> Sign Up
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

