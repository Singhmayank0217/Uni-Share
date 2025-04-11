"use client"

import { useState, useRef, useEffect } from "react"
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
  FiChevronDown,
} from "react-icons/fi"

const Navbar = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const dropdownButtonRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <nav className="bg-gradient-to-r from-cyan-500 to-sky-800 dark:from-gray-800 dark:to-gray-900 text-white  shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <span className="bg-white text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 dark:from-emerald-400 dark:to-teal-400 ">
              Uni
            </span>
            <span className="bg-gradient-to-r text-white dark:from-emerald-400 dark:to-teal-400 text-transparent bg-clip-text">Share</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-teal-400  flex items-center gap-1">
              <FiHome /> Home
            </Link>
            <Link to="/leaderboard" className="hover:text-teal-400 flex items-center gap-1">
              <FiAward /> Leaderboard
            </Link>

            {currentUser ? (
              <>
                <Link to="/dashboard" className="hover:text-teal-400 flex items-center gap-1">
                  <FiGrid /> Dashboard
                </Link>
                <Link to="/upload" className="hover:text-teal-400 flex items-center gap-1">
                  <FiUpload /> Upload
                </Link>
                <Link to="/bookmarks" className="hover:text-teal-400 flex items-center gap-1">
                  <FiBookmark /> Bookmarks
                </Link>
                <Link to="/study-groups" className="hover:text-teal-400 flex items-center gap-1">
                  <FiUsers /> Study Groups
                </Link>
                <ThemeToggle />
                <div className="relative">
                  <button
                    ref={dropdownButtonRef}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center hover:text-teal-400 focus:outline-none"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span className="mr-1">{currentUser.name}</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10"
                    >
                      <Link
                        to="/profile"
                        className=" px-4 py-2 text-gray-800 dark:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white flex items-center gap-2"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiUser /> Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          handleLogout()
                        }}
                        className=" w-full text-left px-4 py-2 text-gray-800 dark:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white flex items-center gap-2"
                      >
                        <FiLogOut /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-teal-400 flex items-center gap-1">
                  <FiLogIn /> Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-md font-semibold hover:text-teal-400 border border-white flex items-center gap-1"
                >
                  <FiUserPlus className="text-white mr-1" />{" "}
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
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
            <Link to="/" className=" py-2 hover:text-teal-400 flex items-center gap-2">
              <FiHome /> Home
            </Link>
            <Link to="/leaderboard" className=" py-2 hover:text-teal-400 flex items-center gap-2">
              <FiAward /> Leaderboard
            </Link>

            {currentUser ? (
              <>
                <Link to="/dashboard" className=" py-2 hover:text-teal-400 flex items-center gap-2">
                  <FiGrid /> Dashboard
                </Link>
                <Link to="/upload" className=" py-2 hover:text-teal-400 flex items-center gap-2">
                  <FiUpload /> Upload
                </Link>
                <Link to="/bookmarks" className=" py-2 hover:text-teal-400 flex items-center gap-2">
                  <FiBookmark /> Bookmarks
                </Link>
                <Link to="/study-groups" className=" py-2 hover:text-teal-400 flex items-center gap-2">
                  <FiUsers /> Study Groups
                </Link>
                <Link to="/profile" className=" py-2 hover:text-teal-400 flex items-center gap-2">
                  <FiUser /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className=" py-2 hover:text-teal-400 w-full text-left flex items-center gap-2"
                >
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className=" py-2 hover:text-teal-400 flex items-center gap-2">
                  <FiLogIn /> Login
                </Link>
                <Link to="/register" className=" py-2 hover:text-teal-400 flex items-center gap-2">
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

