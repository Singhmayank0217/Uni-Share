"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import ResourceCard from "../components/resources/ResourceCard"
import { FiUpload, FiBookmark, FiStar, FiDownload, FiEye, FiTrash2, FiAlertCircle } from "react-icons/fi"
import toast from "react-hot-toast"
import { useTheme } from "../contexts/ThemeContext"

const Dashboard = () => {
  const { currentUser } = useAuth()
  const { darkMode } = useTheme()
  const navigate = useNavigate()
  const [resources, setResources] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [stats, setStats] = useState({
    uploadCount: 0,
    bookmarkCount: 0,
    reviewCount: 0,
    totalViews: 0,
    totalDownloads: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("uploads")
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (activeTab === "uploads") {
      fetchUserUploads()
    } else if (activeTab === "bookmarks") {
      fetchUserBookmarks()
    }
  }, [activeTab])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      // Use the correct endpoint for user stats
      const response = await api.get("/api/users/uploads")

      // Calculate stats from the resources
      if (response.data && Array.isArray(response.data)) {
        const uploadCount = response.data.length
        const totalViews = response.data.reduce((sum, resource) => sum + (resource.views || 0), 0)
        const totalDownloads = response.data.reduce((sum, resource) => sum + (resource.downloads || 0), 0)

        setStats({
          uploadCount,
          bookmarkCount: currentUser?.bookmarkCount || 0,
          reviewCount: currentUser?.reviewCount || 0,
          totalViews,
          totalDownloads,
        })
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching user stats:", err)
      setError("Failed to load your stats. Please try again later.")
      toast.error("Failed to load user statistics")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserUploads = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/users/uploads")
      setResources(response.data.map((resource) => ({ ...resource, isOwner: true })))
      setError(null)
    } catch (err) {
      console.error("Error fetching user uploads:", err)
      setError("Failed to load your uploads. Please try again later.")
      toast.error("Failed to load your uploads")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBookmarks = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/users/bookmarks")
      setBookmarks(response.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching user bookmarks:", err)
      setError("Failed to load your bookmarks. Please try again later.")
      toast.error("Failed to load your bookmarks")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteResource = async (resourceId) => {
    setDeleteConfirm(resourceId)
  }

  const confirmDelete = async (resourceId) => {
    try {
      setDeleting(true)
      await api.delete(`/api/resources/${resourceId}`)

      // Update resources list
      setResources(resources.filter((resource) => resource._id !== resourceId))

      // Update stats
      setStats((prev) => ({
        ...prev,
        uploadCount: prev.uploadCount - 1,
      }))

      toast.success("Resource deleted successfully")
    } catch (error) {
      console.error("Error deleting resource:", error)
      toast.error("Failed to delete resource: " + (error.response?.data?.message || error.message))
    } finally {
      setDeleting(false)
      setDeleteConfirm(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  const renderStatCard = (icon, title, value, color) => (
    <div
      className={`bg-gradient-to-br ${color} rounded-xl shadow-md p-5 transition-transform duration-300 hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${darkMode ? "bg-opacity-20 bg-white" : "bg-opacity-20 bg-black"}`}>
          {icon}
        </div>
      </div>
    </div>
  )

  const renderDeleteConfirmation = () => {
    if (!deleteConfirm) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
          <div className="flex items-center justify-center mb-4 text-red-500">
            <FiAlertCircle size={48} />
          </div>
          <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">Delete Resource</h3>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to delete this resource? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={cancelDelete}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={() => confirmDelete(deleteConfirm)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none flex items-center"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 className="mr-2" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderEmptyState = (type) => {
    const isUploads = type === "uploads"
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isUploads ? "bg-blue-100 dark:bg-blue-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}
        >
          {isUploads ? (
            <FiUpload className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          ) : (
            <FiBookmark className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          )}
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          {isUploads ? "No uploads yet" : "No bookmarks yet"}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
          {isUploads
            ? "Share your knowledge with other students by uploading study materials."
            : "Save resources you find useful to access them quickly later."}
        </p>
        <Link
          to={isUploads ? "/upload" : "/"}
          className={`px-6 py-3 rounded-lg font-medium text-white shadow-lg transition-all hover:shadow-xl ${
            isUploads
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          }`}
        >
          {isUploads ? "Upload a Resource" : "Browse Resources"}
        </Link>
      </div>
    )
  }

  const renderLoading = () => (
    <div className="flex justify-center items-center py-20">
      <div className="relative">
        <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-200"></div>
        <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-blue-500 border-t-transparent"></div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {renderDeleteConfirmation()}

      {/* User Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100 dark:border-gray-700">
        <div className="relative h-32 bg-gradient-to-r  dark:from-emerald-500  dark:to-teal-800 from-sky-500 to-cyan-900">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-700 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br  dark:from-emerald-500  dark:to-teal-800  from-sky-500 to-cyan-900 flex items-center justify-center text-white text-3xl font-bold">
                {currentUser?.name?.charAt(0) || "U"}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 pb-6 px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser?.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{currentUser?.email}</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link
                to="/profile"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Edit Profile
              </Link>
              <Link
                to="/upload"
                className="px-4 py-2 bg-gradient-to-r dark:from-emerald-500  dark:to-teal-800  from-sky-500 to-cyan-900 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
              >
                <FiUpload className="inline mr-2" /> Upload
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {renderStatCard(
          <FiUpload className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
          "Uploads",
          stats.uploadCount,
          "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-800 dark:text-blue-200",
        )}
        {renderStatCard(
          <FiBookmark className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
          "Bookmarks",
          stats.bookmarkCount,
          "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 text-amber-800 dark:text-amber-200",
        )}
        {renderStatCard(
          <FiStar className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
          "Reviews",
          stats.reviewCount,
          "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-800 dark:text-purple-200",
        )}
        {renderStatCard(
          <FiEye className="w-6 h-6 text-green-600 dark:text-green-400" />,
          "Total Views",
          stats.totalViews,
          "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-800 dark:text-green-200",
        )}
        {renderStatCard(
          <FiDownload className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
          "Downloads",
          stats.totalDownloads,
          "from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 text-rose-800 dark:text-rose-200",
        )}
      </div>

      {/* Content Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("uploads")}
              className={`px-6 py-4 text-sm font-medium border-b-2 focus:outline-none ${
                activeTab === "uploads"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              My Uploads
            </button>
            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`px-6 py-4 text-sm font-medium border-b-2 focus:outline-none ${
                activeTab === "bookmarks"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              My Bookmarks
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            renderLoading()
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg text-center">
              <FiAlertCircle className="inline-block mr-2" />
              {error}
            </div>
          ) : activeTab === "uploads" ? (
            resources.length === 0 ? (
              renderEmptyState("uploads")
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                  <ResourceCard key={resource._id} resource={resource} onDelete={handleDeleteResource} />
                ))}
              </div>
            )
          ) : bookmarks.length === 0 ? (
            renderEmptyState("bookmarks")
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((resource) => (
                <ResourceCard key={resource._id} resource={resource} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
