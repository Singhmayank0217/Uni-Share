"use client"

import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  FiHome,
  FiBookOpen,
  FiMail,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiInstagram,
  FiArrowUp,
  FiHeart,
} from "react-icons/fi"

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    // Animation on mount
    setIsVisible(true)

    // Scroll to top button visibility
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <footer className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-600 rounded-full opacity-10 animate-float-slow"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-teal-500 rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-10 left-1/3 w-48 h-48 bg-blue-600 rounded-full opacity-10 animate-float-delay"></div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 transition-all duration-300 z-50 animate-bounce-slow"
          aria-label="Scroll to top"
        >
          <FiArrowUp className="w-5 h-5" />
        </button>
      )}

      <div className="container mx-auto px-4 relative z-10">
        {/* Footer content with fade-in animation */}
        <div className={`transition-opacity duration-1000 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo and description */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <h3 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Uni
                  </span>
                  <span>Share</span>
                </h3>
              </div>
              <p className="text-gray-300 mb-6">
                A platform for university students to share educational resources and collaborate in a supportive
                community.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-300 hover:scale-110 transform"
                >
                  <FiGithub className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-300 hover:scale-110 transform"
                >
                  <FiTwitter className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-300 hover:scale-110 transform"
                >
                  <FiLinkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-300 hover:scale-110 transform"
                >
                  <FiInstagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-1">
              <h4 className="text-lg font-semibold mb-5 flex items-center">
                <span className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center mr-2">
                  <FiHome className="w-4 h-4" />
                </span>
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li className="transform hover:translate-x-2 transition-transform duration-300">
                  <Link to="/" className="text-gray-300 hover:text-emerald-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                    Home
                  </Link>
                </li>
                <li className="transform hover:translate-x-2 transition-transform duration-300">
                  <Link to="/leaderboard" className="text-gray-300 hover:text-emerald-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                    Leaderboard
                  </Link>
                </li>
                <li className="transform hover:translate-x-2 transition-transform duration-300">
                  <Link to="/study-groups" className="text-gray-300 hover:text-emerald-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                    Study Groups
                  </Link>
                </li>
                <li className="transform hover:translate-x-2 transition-transform duration-300">
                  <Link to="/upload" className="text-gray-300 hover:text-emerald-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                    Upload Resources
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="md:col-span-1">
              <h4 className="text-lg font-semibold mb-5 flex items-center">
                <span className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center mr-2">
                  <FiBookOpen className="w-4 h-4" />
                </span>
                Resources
              </h4>
              <ul className="space-y-3">
                <li className="transform hover:translate-x-2 transition-transform duration-300">
                  <Link to="/?category=notes" className="text-gray-300 hover:text-teal-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2"></span>
                    Notes
                  </Link>
                </li>
                <li className="transform hover:translate-x-2 transition-transform duration-300">
                  <Link to="/?category=past-papers" className="text-gray-300 hover:text-teal-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2"></span>
                    Past Papers
                  </Link>
                </li>
                <li className="transform hover:translate-x-2 transition-transform duration-300">
                  <Link to="/?category=assignments" className="text-gray-300 hover:text-teal-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2"></span>
                    Assignments
                  </Link>
                </li>
                <li className="transform hover:translate-x-2 transition-transform duration-300">
                  <Link to="/?category=presentations" className="text-gray-300 hover:text-teal-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2"></span>
                    Presentations
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-1">
              <h4 className="text-lg font-semibold mb-5 flex items-center">
                <span className="w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center mr-2">
                  <FiMail className="w-4 h-4" />
                </span>
                Team
              </h4>
              <p className="text-gray-300 mb-4">Our Dedicated team members</p>
              <a
                href="https://mayanksinghrajput.vercel.app/"
                className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-md hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 mr-2"
              >
                Mayank 
              </a>
              <a
                href="https://rahulchoudhary05.vercel.app/"
                className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-md hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105"
              >
                Rahul 
              </a>
            </div>
          </div>

          <div className="mt-12 py-8 border-t border-gray-600">
          </div>

          {/* Copyright */}
          <div className="text-center  text-gray-400">
            <p className="flex items-center justify-center">
              &copy; {new Date().getFullYear()} UniShare. Made with
              <FiHeart className="mx-1 text-red-500 animate-pulse" />
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

