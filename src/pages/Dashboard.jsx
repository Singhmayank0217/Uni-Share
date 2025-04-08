"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import ResourceCard from "../components/resources/ResourceCard"

const Dashboard = () => {
  const { currentUser } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("uploads")

  useEffect(() => {
    if (activeTab === "uploads") {
      fetchUserUploads()
    } else if (activeTab === "bookmarks") {
      fetchUserBookmarks()
    }
  }, [activeTab])

  const fetchUserUploads = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/users/uploads")
      setResources(response.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching user uploads:", err)
      setError("Failed to load your uploads. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBookmarks = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/users/bookmarks")
      setResources(response.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching user bookmarks:", err)
      setError("Failed to load your bookmarks. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link to="/upload" className="bg-blue-600 text-white px-4 py-2 rounded-[5px] font-semibold hover:bg-teal-400">
          Upload New Resource
        </Link>
      </div>

      <div className="bg-white dark:bg-teal-400 rounded-[10px] shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-4">Welcome, {currentUser.name}!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-[5px]">
              <div className="text-2xl font-bold text-center  text-blue-600 mb-1">{currentUser.uploadCount || 0}</div>
              <div className="text-sm text-center text-gray-600">Resources Uploaded</div>
            </div>
            <div className="bg-green-50 p-4 rounded-[5px]">
              <div className="text-2xl font-bold text-center text-green-600 mb-1">{currentUser.bookmarkCount || 0}</div>
              <div className="text-sm text-center text-gray-600">Bookmarked Resources</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-[5px]">
              <div className="text-2xl font-bold text-center text-purple-600 mb-1">{currentUser.reviewCount || 0}</div>
              <div className="text-sm text-center text-gray-600">Reviews Written</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === "uploads"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("uploads")}
            >
              My Uploads
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === "bookmarks"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("bookmarks")}
            >
              My Bookmarks
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">{error}</div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">
            {activeTab === "uploads"
              ? "You haven't uploaded any resources yet"
              : "You haven't bookmarked any resources yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === "uploads"
              ? "Share your knowledge with other students by uploading resources"
              : "Bookmark resources to access them quickly later"}
          </p>
          {activeTab === "uploads" && (
            <Link to="/upload" className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700">
              Upload a Resource
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard

